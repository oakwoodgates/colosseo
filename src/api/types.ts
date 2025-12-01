// Strategy types
export interface Strategy {
  id: number
  strategy_name: string
  version: string
  starlisting_id: number
  interval: string
  model_id: string | null
  is_active: boolean
  created_at: number | null
  updated_at: number | null
}

export interface StrategyWithStats extends Strategy {
  total_trades: number
  open_positions: number
  total_pnl_usd: number
  total_pnl_pct: number
  realized_pnl_usd: number
  unrealized_pnl_usd: number
  win_count: number
  loss_count: number
  win_rate: number
  avg_win_usd: number
  avg_loss_usd: number
  profit_factor: number
}

export interface StrategyListResponse {
  strategies: Strategy[]
  total: number
}

// Trade types
export interface Trade {
  id: number
  position_id: number
  strategy_id: number
  starlisting_id: number
  trade_type: 'open_long' | 'open_short' | 'close_long' | 'close_short'
  size: number
  price: number
  fees: number
  slippage: number
  timestamp: number
  signal_id: number | null
  created_at: number | null
  strategy_name: string | null
  position_side: string | null
}

export interface TradeListResponse {
  trades: Trade[]
  total: number
  limit: number
  offset: number
}

// Position types
export type PositionSide = 'long' | 'short'
export type PositionStatus = 'open' | 'closed' | 'liquidated'
export type ExitReason = 'signal' | 'stop_loss' | 'take_profit' | 'manual'

export interface Position {
  id: number
  strategy_id: number
  starlisting_id: number
  side: PositionSide
  size: number
  entry_price: number
  entry_timestamp: number
  exit_price: number | null
  exit_timestamp: number | null
  exit_reason: ExitReason | null
  realized_pnl: number | null
  unrealized_pnl: number | null
  fees_paid: number
  status: PositionStatus
  stop_loss_price: number | null
  take_profit_price: number | null
  strategy_name: string | null
  duration_minutes: number | null
  pnl_pct: number | null
  created_at: number | null
  updated_at: number | null
}

export interface PositionListResponse {
  positions: Position[]
  total: number
  limit: number
  offset: number
}

// Portfolio types
export interface PortfolioSummary {
  initial_capital_usd: number
  total_capital_usd: number
  available_capital_usd: number
  allocated_capital_usd: number
  total_pnl_usd: number
  total_pnl_pct: number
  realized_pnl_usd: number
  unrealized_pnl_usd: number
  open_positions: number
  total_positions: number
  total_trades: number
  active_strategies: number
}

export interface EquityPoint {
  timestamp: number
  equity_usd: number
  realized_pnl_usd: number
  unrealized_pnl_usd: number
  open_positions: number
}

export interface EquityHistoryResponse {
  points: EquityPoint[]
  initial_capital_usd: number
  current_equity_usd: number
  max_equity_usd: number
  min_equity_usd: number
  max_drawdown_usd: number
  max_drawdown_pct: number
}

// Stats types
export interface FinancialSummary {
  total_equity_usd: number
  total_pnl_usd: number
  total_pnl_pct: number
  realized_pnl_usd: number
  unrealized_pnl_usd: number
  total_trades: number
  total_wins: number
  total_losses: number
  win_rate: number
  avg_win_usd: number
  avg_loss_usd: number
  largest_win_usd: number
  largest_loss_usd: number
  profit_factor: number
  avg_trade_usd: number
  expectancy_usd: number
  max_drawdown_usd: number
  max_drawdown_pct: number
  total_fees_paid: number
  timestamp: number
}

export interface LeaderboardEntry {
  rank: number
  strategy_id: number
  strategy_name: string
  interval: string
  total_pnl_usd: number
  total_pnl_pct: number
  win_rate: number
  total_trades: number
  profit_factor: number
  avg_trade_usd: number
  max_drawdown_pct: number | null
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[]
  metric: string
  total_strategies: number
}

// WebSocket types
export interface WSMessage {
  type: string
  channel: string
  data: unknown
}

export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}
