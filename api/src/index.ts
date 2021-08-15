import express, { Request, Response, NextFunction } from 'express'
import routes from './routes'
import { badRequest } from './errors'

const app = express()
const port = 3000

app.use((_, res, next) => {
    res.header('Content-Type', 'application/json;charset=utf-8')
    next()
})

app.use(express.json())
app.use((err: Error, _: Request, res: Response, __: NextFunction) => badRequest(res, err.message ?? err))

app.use(routes)

app.listen(port, () => {
    console.log(`Running on port ${port}\nhttp://0.0.0.0:${port}`)
})
