import { createChart, Time, CandlestickSeries, HistogramSeries, createSeriesMarkers } from 'lightweight-charts'
import type { Candle, Trade } from '../../api/types'

export interface ChartAdapter {
  setData(candles: Candle[]): void
  updateCandle(candle: Candle): void
  setMarkers(trades: Trade[]): void
  resize(width: number, height: number): void
  destroy(): void
}

interface CreateChartOptions {
  container: HTMLElement
  width: number
  height: number
}

interface CandleData {
  time: Time
  open: number
  high: number
  low: number
  close: number
}

interface MarkerData {
  time: Time
  position: 'belowBar' | 'aboveBar'
  color: string
  shape: 'arrowUp' | 'arrowDown'
  text: string
}

interface VolumeData {
  time: Time
  value: number
  color: string
}

export function createChartAdapter(options: CreateChartOptions): ChartAdapter {
  const { container, width, height } = options

  const chart = createChart(container, {
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
    crosshair: {
      mode: 1,
    },
    rightPriceScale: {
      borderColor: '#333333',
    },
    timeScale: {
      borderColor: '#333333',
      timeVisible: true,
    },
  })

  const candlestickSeries = chart.addSeries(CandlestickSeries, {
    upColor: '#22c55e',
    downColor: '#ef4444',
    borderDownColor: '#ef4444',
    borderUpColor: '#22c55e',
    wickDownColor: '#ef4444',
    wickUpColor: '#22c55e',
  })

  // Add volume histogram series
  const volumeSeries = chart.addSeries(HistogramSeries, {
    priceFormat: { type: 'volume' },
    priceScaleId: 'volume',
  })

  // Configure volume scale at bottom 30% of chart
  chart.priceScale('volume').applyOptions({
    scaleMargins: { top: 0.7, bottom: 0 },
  })

  // Create markers plugin for trade markers
  const markersPlugin = createSeriesMarkers(candlestickSeries, [])

  function convertCandle(candle: Candle): CandleData {
    return {
      time: candle.time as Time, // Already in seconds from useWebSocket
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }
  }

  function convertVolume(candle: Candle): VolumeData {
    const isUp = candle.close >= candle.open
    return {
      time: candle.time as Time,
      value: candle.volume ?? 0,
      color: isUp ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
    }
  }

  return {
    setData(candles: Candle[]) {
      const sortedCandles = [...candles].sort((a, b) => a.time - b.time)
      candlestickSeries.setData(sortedCandles.map(convertCandle))
      volumeSeries.setData(sortedCandles.map(convertVolume))
      chart.timeScale().fitContent()
    },

    updateCandle(candle: Candle) {
      candlestickSeries.update(convertCandle(candle))
      volumeSeries.update(convertVolume(candle))
    },

    setMarkers(trades: Trade[]) {
      const markers: MarkerData[] = trades
        .map((trade) => {
          const isOpen = trade.trade_type.includes('open')
          const isLong = trade.trade_type.includes('long')
          const position: 'belowBar' | 'aboveBar' = isOpen ? 'belowBar' : 'aboveBar'
          const shape: 'arrowUp' | 'arrowDown' = isOpen ? 'arrowUp' : 'arrowDown'
          return {
            time: (trade.timestamp / 1000) as Time,
            position,
            color: isLong ? '#22c55e' : '#ef4444',
            shape,
            text: `${isOpen ? 'Open' : 'Close'} ${isLong ? 'Long' : 'Short'}`,
          }
        })
        .sort((a, b) => (a.time as number) - (b.time as number))

      markersPlugin.setMarkers(markers)
    },

    resize(newWidth: number, newHeight: number) {
      chart.resize(newWidth, newHeight)
    },

    destroy() {
      chart.remove()
    },
  }
}
