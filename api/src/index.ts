import express, { Request, Response, NextFunction } from 'express'
import routes from './routes'
import { badRequest, internal } from './errors'
import jwt from 'jsonwebtoken'
import { config as dotenv } from 'dotenv'
import { resolve as path } from 'path'
import User from './types/User'

dotenv({ path: path(__dirname, '../env') })

const app = express()
const port = 3000

app.use((req, res, next) => {
  res.header('Content-Type', 'application/json;charset=utf-8')

  const authHeader = req.header('Authorization')
  if (authHeader != null && /^\s*Bearer/.test(authHeader)) {
    const token = authHeader.match(/^\s*Bearer\s*([\w.-]+)/)?.[1] ?? ''
    const tokenSecret = process.env.TOKEN_SECRET

    if (tokenSecret == null) return internal(res, 'TOKEN_SECRET not provided')

    jwt.verify(token, tokenSecret, (err, data) => {
      if (err != null || data == null) {
        // @ts-expect-error
        req.user = null
        next()
      } else {
        User.getById(parseInt(data.sub as string))
          .then(user => {
            // @ts-expect-error
            req.user = user
            next()
          })
          .catch(e => {
            console.warn('Unable to parse JWT')
            console.warn(e instanceof Error ? e.message : e)
            next()
          })
      }
    })
  } else {
    next()
  }
})

app.use(express.json())
app.use((err: Error, _: Request, res: Response, __: NextFunction) => badRequest(res, err.message ?? err))

app.use(routes)

app.listen(port, () => {
  console.log(`Running on port ${port}\nhttp://0.0.0.0:${port}`)
})
