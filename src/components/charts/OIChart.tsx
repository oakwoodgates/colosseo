import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { createChart, LineSeries, Time } from 'lightweight-charts'
import { useWebSocket } from '../../hooks/useWebSocket'
import type { OpenInterestPoint } from '../../api/types'

interface OIChartProps {
  starlistingId: number
  height?: number
}

function formatOI(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`
  }
  return value.toFixed(2)
}

export function OIChart({ starlistingId, height = 200 }: OIChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)
  const seriesRef = useRef<ReturnType<ReturnType<typeof createChart>['addSeries']> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const initialDataLoaded = useRef(false)

  // Memoize arrays to prevent infinite re-renders
  const channels = useMemo(() => ['prices'] as ('prices')[], [])
  const starlistingIds = useMemo(() => [starlistingId], [starlistingId])

  // Handle initial OI data from WebSocket
  const handleOIData = useCallback((data: OpenInterestPoint[]) => {
    if (seriesRef.current) {
      const chartData = data
        .map((d) => ({
          time: d.time as Time,
          value: d.open_interest,
        }))
        .sort((a, b) => (a.time as number) - (b.time as number))
      seriesRef.current.setData(chartData)
      chartRef.current?.timeScale().fitContent()
      initialDataLoaded.current = true
    }
    setIsLoading(false)
  }, [])

  // Handle real-time OI updates
  const handleOIUpdate = useCallback((data: OpenInterestPoint) => {
    if (seriesRef.current && initialDataLoaded.current) {
      seriesRef.current.update({
        time: data.time as Time,
        value: data.open_interest,
      })
    }
  }, [])

  // Connect to WebSocket for OI data
  useWebSocket({
    channels,
    starlistingIds,
    history: 500,
    onOIData: handleOIData,
    onOIUpdate: handleOIUpdate,
  })

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth

    chartRef.current = createChart(container, {
      width,
      height,
      layout: {
        background: { color: '#1a1a1a' },
        textColor: '#a1a1a1',
      },
      grid: {
        vertLines: { color: '#333333' },
        horzLines: { color: '#333333' },
      },
      rightPriceScale: {
        borderColor: '#333333',
      },
      timeScale: {
        borderColor: '#333333',
        timeVisible: true,
      },
    })

    seriesRef.current = chartRef.current.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 2,
      priceFormat: {
        type: 'custom',
        formatter: formatOI,
      },
    })

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      const { width: newWidth } = entries[0].contentRect
      chartRef.current?.resize(newWidth, height)
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      chartRef.current?.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [height])

  return (
    <div className="relative w-full rounded overflow-hidden" style={{ height }}>
      <div ref={containerRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-tertiary">
          <div className="text-text-muted text-sm">Loading open interest...</div>
        </div>
      )}
    </div>
  )
}
