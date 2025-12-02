import type { WSMessage, Trade, Position, PriceHistoricalData, PriceCandleData } from './types'

type Channel = 'trades' | 'positions' | 'portfolio' | 'prices' | 'signals'

interface SubscribeOptions {
  channels: Channel[]
  history?: number
  starlistingIds?: number[]
  strategyId?: number
}

interface WSOptions {
  onMessage?: (msg: WSMessage) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  reconnect?: boolean
  reconnectInterval?: number
}

type MessageListener = (msg: WSMessage) => void
type ConnectionListener = () => void

export class WebSocketManager {
  private ws: WebSocket | null = null
  private url: string
  private options: WSOptions
  private channels: Set<Channel> = new Set()
  private channelHistory: Map<Channel, number> = new Map()
  private starlistingIds: Set<number> = new Set()
  private strategyId: number | null = null
  private reconnectTimer: number | null = null
  private isIntentionalClose = false
  private messageListeners: Set<MessageListener> = new Set()
  private openListeners: Set<ConnectionListener> = new Set()
  private closeListeners: Set<ConnectionListener> = new Set()

  constructor(url: string, options: WSOptions = {}) {
    this.url = url
    this.options = {
      reconnect: true,
      reconnectInterval: 3000,
      ...options,
    }
  }

  addMessageListener(listener: MessageListener): () => void {
    this.messageListeners.add(listener)
    return () => this.messageListeners.delete(listener)
  }

  addOpenListener(listener: ConnectionListener): () => void {
    this.openListeners.add(listener)
    return () => this.openListeners.delete(listener)
  }

  addCloseListener(listener: ConnectionListener): () => void {
    this.closeListeners.add(listener)
    return () => this.closeListeners.delete(listener)
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    this.isIntentionalClose = false
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      this.options.onOpen?.()
      this.openListeners.forEach(listener => listener())
      // Resubscribe to channels on reconnect with stored options
      if (this.channels.size > 0) {
        const channelsArray = [...this.channels]
        const maxHistory = Math.max(...channelsArray.map(ch => this.channelHistory.get(ch) || 0))
        this.subscribe({
          channels: channelsArray,
          history: maxHistory > 0 ? maxHistory : undefined,
          starlistingIds: this.starlistingIds.size > 0 ? [...this.starlistingIds] : undefined,
          strategyId: this.strategyId ?? undefined,
        })
      }
    }

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as WSMessage
        this.options.onMessage?.(msg)
        this.messageListeners.forEach(listener => listener(msg))
      } catch (e) {
        console.error('[WebSocketManager] Failed to parse message:', e)
      }
    }

    this.ws.onclose = () => {
      this.options.onClose?.()
      this.closeListeners.forEach(listener => listener())
      if (this.options.reconnect && !this.isIntentionalClose) {
        this.scheduleReconnect()
      }
    }

    this.ws.onerror = (error) => {
      this.options.onError?.(error)
    }
  }

  disconnect(): void {
    this.isIntentionalClose = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.ws?.close()
    this.ws = null
  }

  subscribe(options: SubscribeOptions): void {
    const { channels, history, starlistingIds, strategyId } = options

    channels.forEach((ch) => {
      this.channels.add(ch)
      if (history !== undefined) {
        this.channelHistory.set(ch, history)
      }
    })

    if (starlistingIds) {
      starlistingIds.forEach(id => this.starlistingIds.add(id))
    }
    if (strategyId !== undefined) {
      this.strategyId = strategyId
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      const msg: Record<string, unknown> = {
        action: 'subscribe',
        channels,
      }
      if (history !== undefined) {
        msg.history = history
      }
      if (starlistingIds && starlistingIds.length > 0) {
        msg.starlisting_ids = starlistingIds
      }
      if (strategyId !== undefined) {
        msg.filters = { strategy_id: strategyId }
      }
      this.ws.send(JSON.stringify(msg))
    }
  }

  unsubscribe(channels: Channel[]): void {
    channels.forEach((ch) => this.channels.delete(ch))

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          action: 'unsubscribe',
          channels,
        }),
      )
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, this.options.reconnectInterval)
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// Singleton instance for the app
let wsManager: WebSocketManager | null = null

export function getWebSocketManager(): WebSocketManager {
  if (!wsManager) {
    const wsUrl = `ws://${window.location.hostname}:8001/ws`
    wsManager = new WebSocketManager(wsUrl)
  }
  return wsManager
}

// Type guards for WebSocket messages
export function isTradeMessage(msg: WSMessage): msg is WSMessage & { data: Trade } {
  return msg.type === 'trade.new'
}

export function isPositionMessage(msg: WSMessage): msg is WSMessage & { data: Position } {
  return msg.type === 'position.opened' || msg.type === 'position.closed' || msg.type === 'position.pnl_update'
}

export function isPortfolioMessage(msg: WSMessage): boolean {
  return msg.type === 'portfolio.update'
}

export function isPriceHistoricalMessage(msg: WSMessage): msg is WSMessage & { data: PriceHistoricalData } {
  return msg.type === 'price.historical'
}

export function isPriceCandleMessage(msg: WSMessage): msg is WSMessage & { data: PriceCandleData } {
  return msg.type === 'price.candle'
}
