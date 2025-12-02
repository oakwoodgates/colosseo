import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  getWebSocketManager,
  isTradeMessage,
  isPositionMessage,
  isPortfolioMessage,
  isPriceHistoricalMessage,
  isPriceCandleMessage,
} from '../api/websocket'
import type { WSMessage, Candle, RawCandle, PriceCandleData } from '../api/types'

type Channel = 'trades' | 'positions' | 'portfolio' | 'prices' | 'signals'

interface UseWebSocketOptions {
  channels: Channel[]
  history?: number
  starlistingIds?: number[]
  strategyId?: number
  onPriceData?: (candles: Candle[]) => void
  onPriceUpdate?: (candle: Candle) => void
}

// Convert ISO timestamp to unix seconds for Lightweight Charts
function parseTime(isoTime: string): number {
  return Math.floor(new Date(isoTime).getTime() / 1000)
}

// Convert raw candle (ISO time) to chart candle (unix time)
function convertCandle(raw: RawCandle): Candle {
  return {
    time: parseTime(raw.time),
    open: raw.open,
    high: raw.high,
    low: raw.low,
    close: raw.close,
    volume: raw.volume,
  }
}

// Convert price.candle data to Candle
function convertPriceCandleData(data: PriceCandleData): Candle {
  return {
    time: parseTime(data.time),
    open: data.open,
    high: data.high,
    low: data.low,
    close: data.close,
    volume: data.volume,
  }
}

export function useWebSocket(options: UseWebSocketOptions) {
  const { channels, history, starlistingIds, strategyId, onPriceData, onPriceUpdate } = options
  const [isConnected, setIsConnected] = useState(false)
  const queryClient = useQueryClient()
  const wsManager = useRef(getWebSocketManager())

  // Use ref for callbacks to avoid re-registering listeners when they change
  const callbacksRef = useRef({ onPriceData, onPriceUpdate, starlistingIds })
  callbacksRef.current = { onPriceData, onPriceUpdate, starlistingIds }

  useEffect(() => {
    const manager = wsManager.current

    // Add message listener
    const removeMessageListener = manager.addMessageListener((msg: WSMessage) => {
      const { onPriceData, onPriceUpdate, starlistingIds } = callbacksRef.current

      if (isTradeMessage(msg)) {
        queryClient.invalidateQueries({ queryKey: ['trades'] })
      } else if (isPositionMessage(msg)) {
        queryClient.invalidateQueries({ queryKey: ['positions'] })
      } else if (isPortfolioMessage(msg)) {
        queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      } else if (isPriceHistoricalMessage(msg)) {
        const historicalData = msg.data
        const candles = historicalData.candles.map(convertCandle)
        onPriceData?.(candles)
      } else if (isPriceCandleMessage(msg)) {
        // Filter by starlisting_id if we have a filter
        if (starlistingIds && starlistingIds.length > 0) {
          if (!starlistingIds.includes(msg.data.starlisting_id)) {
            return
          }
        }
        const candle = convertPriceCandleData(msg.data)
        onPriceUpdate?.(candle)
      }
    })

    const removeOpenListener = manager.addOpenListener(() => {
      setIsConnected(true)
    })

    const removeCloseListener = manager.addCloseListener(() => {
      setIsConnected(false)
    })

    manager.connect()
    manager.subscribe({ channels, history, starlistingIds, strategyId })

    return () => {
      removeMessageListener()
      removeOpenListener()
      removeCloseListener()
      manager.unsubscribe(channels)
    }
  }, [channels, history, starlistingIds, strategyId, queryClient])

  return { isConnected }
}

export function useConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const manager = getWebSocketManager()
    const checkConnection = () => setIsConnected(manager.isConnected)

    // Check immediately and set up polling
    checkConnection()
    const interval = setInterval(checkConnection, 1000)

    return () => clearInterval(interval)
  }, [])

  return isConnected
}
