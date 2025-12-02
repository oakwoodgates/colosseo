import WebSocket from 'ws'

const ws = new WebSocket('ws://localhost:8001/ws')

ws.on('open', () => {
  console.log('✓ Connected to Nailsage WebSocket')

  const subscribeMsg = {
    action: 'subscribe',
    channels: ['prices'],
    starlisting_ids: [6],
    history: 500
  }

  console.log('→ Sending:', JSON.stringify(subscribeMsg, null, 2))
  ws.send(JSON.stringify(subscribeMsg))
})

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString())
  console.log('\n← Received:', msg.type || msg.action || 'unknown')
  console.log(JSON.stringify(msg, null, 2))

  // If we get historical data, show summary
  if (msg.type === 'price.historical' && msg.data?.candles) {
    console.log(`\n✓ Got ${msg.data.candles.length} historical candles!`)
    console.log('First candle:', msg.data.candles[0])
    console.log('Last candle:', msg.data.candles[msg.data.candles.length - 1])
  }
})

ws.on('error', (err) => {
  console.error('✗ WebSocket error:', err.message)
})

ws.on('close', () => {
  console.log('Connection closed')
})

// Close after 10 seconds
setTimeout(() => {
  console.log('\nClosing connection after 10 seconds...')
  ws.close()
  process.exit(0)
}, 10000)
