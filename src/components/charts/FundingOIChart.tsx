import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { createChart, BaselineSeries, LineSeries, Time } from 'lightweight-charts'
import { useWebSocket } from '../../hooks/useWebSocket'
import type { FundingRate, OpenInterestPoint } from '../../api/types'

interface FundingOIChartProps {
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

export function FundingOIChart({ starlistingId, height = 250 }: FundingOIChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)
  const fundingSeriesRef = useRef<ReturnType<ReturnType<typeof createChart>['addSeries']> | null>(null)
  const oiSeriesRef = useRef<ReturnType<ReturnType<typeof createChart>['addSeries']> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fundingDataLoaded = useRef(false)
  const oiDataLoaded = useRef(false)

  // Memoize arrays to prevent infinite re-renders
  const channels = useMemo(() => ['prices'] as ('prices')[], [])
  const starlistingIds = useMemo(() => [starlistingId], [starlistingId])

  // Handle initial funding data from WebSocket
  const handleFundingData = useCallback((data: FundingRate[]) => {
    if (fundingSeriesRef.current) {
      const chartData = data
        .map((d) => ({
          time: d.time as Time,
          value: d.funding_rate * 100, // Convert to percentage
        }))
        .sort((a, b) => (a.time as number) - (b.time as number))
      fundingSeriesRef.current.setData(chartData)
      chartRef.current?.timeScale().fitContent()
      fundingDataLoaded.current = true
    }
    if (oiDataLoaded.current) {
      setIsLoading(false)
    }
  }, [])

  // Handle real-time funding updates
  const handleFundingUpdate = useCallback((data: FundingRate) => {
    if (fundingSeriesRef.current && fundingDataLoaded.current) {
      fundingSeriesRef.current.update({
        time: data.time as Time,
        value: data.funding_rate * 100,
      })
    }
  }, [])

  // Handle initial OI data from WebSocket
  const handleOIData = useCallback((data: OpenInterestPoint[]) => {
    if (oiSeriesRef.current) {
      const chartData = data
        .map((d) => ({
          time: d.time as Time,
          value: d.open_interest,
        }))
        .sort((a, b) => (a.time as number) - (b.time as number))
      oiSeriesRef.current.setData(chartData)
      chartRef.current?.timeScale().fitContent()
      oiDataLoaded.current = true
    }
    if (fundingDataLoaded.current) {
      setIsLoading(false)
    }
  }, [])

  // Handle real-time OI updates
  const handleOIUpdate = useCallback((data: OpenInterestPoint) => {
    if (oiSeriesRef.current && oiDataLoaded.current) {
      oiSeriesRef.current.update({
        time: data.time as Time,
        value: data.open_interest,
      })
    }
  }, [])

  // Connect to WebSocket for both funding and OI data
  useWebSocket({
    channels,
    starlistingIds,
    history: 500,
    onFundingData: handleFundingData,
    onFundingUpdate: handleFundingUpdate,
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
      leftPriceScale: {
        borderColor: '#333333',
        visible: true,
      },
      timeScale: {
        borderColor: '#333333',
        timeVisible: true,
      },
    })

    // Funding Rate series (left scale) - BaselineSeries with green/red coloring
    fundingSeriesRef.current = chartRef.current.addSeries(BaselineSeries, {
      baseValue: { type: 'price', price: 0 },
      topLineColor: '#22c55e',
      topFillColor1: 'rgba(34, 197, 94, 0.2)',
      topFillColor2: 'rgba(34, 197, 94, 0.05)',
      bottomLineColor: '#ef4444',
      bottomFillColor1: 'rgba(239, 68, 68, 0.05)',
      bottomFillColor2: 'rgba(239, 68, 68, 0.2)',
      lineWidth: 2,
      priceScaleId: 'left',
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => `${price.toFixed(4)}%`,
      },
    })

    // Open Interest series (right scale) - LineSeries with amber color
    oiSeriesRef.current = chartRef.current.addSeries(LineSeries, {
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
      fundingSeriesRef.current = null
      oiSeriesRef.current = null
    }
  }, [height])

  return (
    <div className="relative w-full rounded overflow-hidden" style={{ height }}>
      <div ref={containerRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-tertiary">
          <div className="text-text-muted text-sm">Loading market data...</div>
        </div>
      )}
      <div className="absolute top-2 left-2 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-[#f59e0b]"></div>
          <span className="text-text-muted">OI</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-[#22c55e]"></div>
          <span className="text-text-muted">Funding</span>
        </div>
      </div>
    </div>
  )
}
