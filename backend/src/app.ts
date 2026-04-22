import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import router from './routes'
import { startSimulation } from './simulation/simulation.service'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use('/api', router)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)


  const result = await startSimulation(5)
  console.log(`${result.message}`)
})

export default app