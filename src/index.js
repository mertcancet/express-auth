import express from 'express'
import bodyParser from 'body-parser'
import AppRouter from './routes'
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

AppRouter(app)

app.get('/', (req, res) => {
  res.send('rest api')
})

app.listen(3300, () => {
  console.log('server is on 3300')
})
