import { useEffect, useRef, useCallback, useState } from 'react'
import { createChartAdapter, type ChartAdapter } from './ChartProvider'
import { useWebSocket } from '../../hooks/useWebSocket'
import type { Candle, Trade } from '../../api/types'

interface PriceChartProps {
  strategyId: number
  interval: string
  trades?: Trade[]
  height?: number
}

export function PriceChart({ strategyId: _strategyId, interval: _interval, trades, height = 400 }: PriceChartProps) {
  // _strategyId and _interval are available for future filtering by strategy/interval
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ChartAdapter | null>(null)
  const [candles, setCandles] = useState<Candle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Handle initial price data from WebSocket
  const handlePriceData = useCallback((data: Candle[]) => {
    setCandles(data)
    setIsLoading(false)
  }, [])

  // Handle real-time price updates
  const handlePriceUpdate = useCallback((candle: Candle) => {
    setCandles((prev) => {
      const existing = prev.findIndex((c) => c.time === candle.time)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = candle
        return updated
      }
      return [...prev, candle]
    })
  }, [])

  // Connect to WebSocket for price data
  useWebSocket({
    channels: ['prices'],
    history: 500,
    onPriceData: handlePriceData,
    onPriceUpdate: handlePriceUpdate,
  })

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth

    chartRef.current = createChartAdapter({
      container,
      width,
      height,
    })

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

  // Update chart data when candles change
  useEffect(() => {
    if (chartRef.current && candles.length > 0) {
      chartRef.current.setData(candles)
    }
  }, [candles])

  // Update markers when trades change
  useEffect(() => {
    if (chartRef.current && trades && trades.length > 0) {
      chartRef.current.setMarkers(trades)
    }
  }, [trades])

  if (isLoading && candles.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-bg-tertiary rounded"
        style={{ height }}
      >
        <div className="text-text-muted">
          Connecting to price feed...
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full rounded overflow-hidden" style={{ height }} />
  )
}
