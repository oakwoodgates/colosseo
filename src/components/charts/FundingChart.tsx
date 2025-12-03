import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { createChart, LineSeries, Time } from 'lightweight-charts'
import { useWebSocket } from '../../hooks/useWebSocket'
import type { FundingRate } from '../../api/types'

interface FundingChartProps {
  starlistingId: number
  height?: number
}

export function FundingChart({ starlistingId, height = 200 }: FundingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)
  const seriesRef = useRef<ReturnType<ReturnType<typeof createChart>['addSeries']> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const initialDataLoaded = useRef(false)

  // Memoize arrays to prevent infinite re-renders
  const channels = useMemo(() => ['prices'] as ('prices')[], [])
  const starlistingIds = useMemo(() => [starlistingId], [starlistingId])

  // Handle initial funding data from WebSocket
  const handleFundingData = useCallback((data: FundingRate[]) => {
    if (seriesRef.current) {
      const chartData = data
        .map((d) => ({
          time: d.time as Time,
          value: d.funding_rate * 100, // Convert to percentage
        }))
        .sort((a, b) => (a.time as number) - (b.time as number))
      seriesRef.current.setData(chartData)
      chartRef.current?.timeScale().fitContent()
      initialDataLoaded.current = true
    }
    setIsLoading(false)
  }, [])

  // Handle real-time funding updates
  const handleFundingUpdate = useCallback((data: FundingRate) => {
    if (seriesRef.current && initialDataLoaded.current) {
      seriesRef.current.update({
        time: data.time as Time,
        value: data.funding_rate * 100,
      })
    }
  }, [])

  // Connect to WebSocket for funding data
  useWebSocket({
    channels,
    starlistingIds,
    history: 500,
    onFundingData: handleFundingData,
    onFundingUpdate: handleFundingUpdate,
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
      color: '#3b82f6',
      lineWidth: 2,
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => `${price.toFixed(4)}%`,
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
          <div className="text-text-muted text-sm">Loading funding data...</div>
        </div>
      )}
    </div>
  )
}
