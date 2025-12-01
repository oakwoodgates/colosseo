# Colosseo

A React frontend for [Nailsage](http://localhost:8001/docs) trading strategies.

## Quick Start

```bash
npm install
npm run dev
```

Opens at http://localhost:3000

## Features

### Home Page (`/`)
- Portfolio overview (equity, P&L, positions, active strategies)
- Recent trades feed
- Top performing strategies
- WebSocket connection status

### Strategies (`/strategies`)
- Leaderboard ranked by P&L, Win Rate, or Profit Factor
- Click any strategy to view details

### Strategy Detail (`/strategies/:id`)
- Performance stats (P&L, win rate, profit factor, trade counts)
- Live candlestick chart with trade markers
- Recent trades list
- Open/closed positions tabs

## Tech Stack

- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS** - Dark theme with trading colors
- **TanStack Query** - Server state management
- **React Router** - Client-side routing
- **Lightweight Charts** - TradingView candlestick charts

## Project Structure

```
src/
├── api/           # API client, types, WebSocket manager
├── components/
│   ├── charts/    # PriceChart with trade markers
│   └── ui/        # Card, Badge, Stat, Table
├── hooks/         # React Query hooks
├── pages/         # HomePage, StrategiesPage, StrategyPage
└── utils/         # Formatting helpers
```

## API Integration

REST endpoints proxied to `http://localhost:8001/api/v1/`:
- `/strategies` - List and detail
- `/trades` - Trade history
- `/positions` - Open/closed positions
- `/portfolio` - Portfolio summary
- `/stats` - Leaderboard and statistics

WebSocket at `ws://localhost:8001/ws`:
- `prices` channel with `history` param for candlestick data
- `trades`, `positions`, `portfolio` for real-time updates

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```
