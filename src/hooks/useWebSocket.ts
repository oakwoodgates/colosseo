import { useEffect, useRef, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getWebSocketManager, isTradeMessage, isPositionMessage, isPriceMessage } from '../api/websocket'
import type { WSMessage, Candle } from '../api/types'

type Channel = 'trades' | 'positions' | 'portfolio' | 'prices' | 'signals'

interface UseWebSocketOptions {
  channels: Channel[]
  history?: number
  onPriceData?: (candles: Candle[]) => void
  onPriceUpdate?: (candle: Candle) => void
}

export function useWebSocket(options: UseWebSocketOptions) {
  const { channels, history, onPriceData, onPriceUpdate } = options
  const [isConnected, setIsConnected] = useState(false)
  const queryClient = useQueryClient()
  const wsManager = useRef(getWebSocketManager())

  const handleMessage = useCallback(
    (msg: WSMessage) => {
      if (isTradeMessage(msg)) {
        // Invalidate trades queries when new trade arrives
        queryClient.invalidateQueries({ queryKey: ['trades'] })
      } else if (isPositionMessage(msg)) {
        // Invalidate positions queries
        queryClient.invalidateQueries({ queryKey: ['positions'] })
      } else if (isPriceMessage(msg)) {
        // Handle price data
        if (Array.isArray(msg.data)) {
          onPriceData?.(msg.data)
        } else {
          onPriceUpdate?.(msg.data)
        }
      } else if (msg.channel === 'portfolio') {
        // Invalidate portfolio queries
        queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      }
    },
    [queryClient, onPriceData, onPriceUpdate],
  )

  useEffect(() => {
    const manager = wsManager.current

    // Set up message handler
    const originalOnMessage = manager['options'].onMessage
    manager['options'].onMessage = (msg: WSMessage) => {
      originalOnMessage?.(msg)
      handleMessage(msg)
    }

    manager['options'].onOpen = () => setIsConnected(true)
    manager['options'].onClose = () => setIsConnected(false)

    // Connect and subscribe
    manager.connect()
    manager.subscribe(channels, history)

    return () => {
      manager.unsubscribe(channels)
    }
  }, [channels, history, handleMessage])

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
