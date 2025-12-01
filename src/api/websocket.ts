import type { WSMessage, Candle, Trade, Position } from './types'

type Channel = 'trades' | 'positions' | 'portfolio' | 'prices' | 'signals'

interface WSOptions {
  onMessage?: (msg: WSMessage) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  reconnect?: boolean
  reconnectInterval?: number
}

export class WebSocketManager {
  private ws: WebSocket | null = null
  private url: string
  private options: WSOptions
  private channels: Set<Channel> = new Set()
  private reconnectTimer: number | null = null
  private isIntentionalClose = false

  constructor(url: string, options: WSOptions = {}) {
    this.url = url
    this.options = {
      reconnect: true,
      reconnectInterval: 3000,
      ...options,
    }
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return

    this.isIntentionalClose = false
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      this.options.onOpen?.()
      // Resubscribe to channels on reconnect
      if (this.channels.size > 0) {
        this.subscribe([...this.channels])
      }
    }

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as WSMessage
        this.options.onMessage?.(msg)
      } catch {
        console.error('Failed to parse WebSocket message')
      }
    }

    this.ws.onclose = () => {
      this.options.onClose?.()
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

  subscribe(channels: Channel[], history?: number): void {
    channels.forEach((ch) => this.channels.add(ch))

    if (this.ws?.readyState === WebSocket.OPEN) {
      const msg: Record<string, unknown> = {
        action: 'subscribe',
        channels,
      }
      if (history !== undefined) {
        msg.history = history
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
  return msg.channel === 'trades'
}

export function isPositionMessage(msg: WSMessage): msg is WSMessage & { data: Position } {
  return msg.channel === 'positions'
}

export function isPriceMessage(msg: WSMessage): msg is WSMessage & { data: Candle | Candle[] } {
  return msg.channel === 'prices'
}
