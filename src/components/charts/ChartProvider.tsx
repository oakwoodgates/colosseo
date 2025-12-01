import { createChart, Time } from 'lightweight-charts'
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

  // Use type assertion to bypass v5 API complexity
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartAny = chart as any
  const candlestickSeries = chartAny.addCandlestickSeries
    ? chartAny.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#22c55e',
        wickDownColor: '#ef4444',
        wickUpColor: '#22c55e',
      })
    : chartAny.addSeries({
        type: 'Candlestick',
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#22c55e',
        wickDownColor: '#ef4444',
        wickUpColor: '#22c55e',
      })

  function convertCandle(candle: Candle): CandleData {
    return {
      time: (candle.time / 1000) as Time, // Convert ms to seconds
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }
  }

  return {
    setData(candles: Candle[]) {
      const data = candles.map(convertCandle).sort((a, b) => (a.time as number) - (b.time as number))
      candlestickSeries.setData(data)
      chart.timeScale().fitContent()
    },

    updateCandle(candle: Candle) {
      candlestickSeries.update(convertCandle(candle))
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

      candlestickSeries.setMarkers(markers)
    },

    resize(newWidth: number, newHeight: number) {
      chart.resize(newWidth, newHeight)
    },

    destroy() {
      chart.remove()
    },
  }
}
