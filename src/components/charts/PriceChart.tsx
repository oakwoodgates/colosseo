import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { createChartAdapter, type ChartAdapter } from './ChartProvider'
import { useWebSocket } from '../../hooks/useWebSocket'
import type { Candle, Trade } from '../../api/types'

interface PriceChartProps {
  starlistingId: number
  interval: string
  trades?: Trade[]
  height?: number
}

export function PriceChart({ starlistingId, interval: _interval, trades, height = 400 }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ChartAdapter | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const initialDataLoaded = useRef(false)

  // Memoize arrays to prevent infinite re-renders
  const channels = useMemo(() => ['prices'] as ('prices')[], [])
  const starlistingIds = useMemo(() => [starlistingId], [starlistingId])

  // Handle initial price data from WebSocket
  const handlePriceData = useCallback((data: Candle[]) => {
    console.log('[PriceChart] Received historical data:', data.length, 'candles')
    if (chartRef.current) {
      chartRef.current.setData(data)
      initialDataLoaded.current = true
    }
    setIsLoading(false)
  }, [])

  // Handle real-time price updates - use updateCandle to preserve zoom
  const handlePriceUpdate = useCallback((candle: Candle) => {
    console.log('[PriceChart] Real-time update:', candle.time)
    if (chartRef.current && initialDataLoaded.current) {
      chartRef.current.updateCandle(candle)
    }
  }, [])

  // Connect to WebSocket for price data
  useWebSocket({
    channels,
    starlistingIds,
    history: 500,
    onPriceData: handlePriceData,
    onPriceUpdate: handlePriceUpdate,
  })

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth

    try {
      chartRef.current = createChartAdapter({
        container,
        width,
        height,
      })
    } catch (err) {
      console.error('[PriceChart] Failed to create chart:', err)
      return
    }

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      const { width: newWidth } = entries[0].contentRect
      chartRef.current?.resize(newWidth, height)
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [height])

  // Update markers when trades change
  useEffect(() => {
    if (chartRef.current && trades && trades.length > 0) {
      chartRef.current.setMarkers(trades)
    }
  }, [trades])

  return (
    <div className="relative w-full rounded overflow-hidden" style={{ height }}>
      <div ref={containerRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-tertiary">
          <div className="text-text-muted">Loading price data...</div>
        </div>
      )}
    </div>
  )
}
