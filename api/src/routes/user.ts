import express from 'express'
import * as errors from '../errors'
import db from '../db'
import DbTypes from '../dbTypes'
import Joi from '@hapi/joi'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { config as dotenv } from 'dotenv'
import { resolve as path } from 'path'
import { route } from '../helpers'

dotenv({ path: path(__dirname, '../../.env') })

const router = express.Router()

route(router, '/', {
  get: (_, res) => {
    db.selectAll<DbTypes.Tables.User>('user')
      .then(({ data }) => res.json(data.map(user => {
        return {
          username: user.username,
          displayName: user.display_name,
          email: user.email,
          bio: user.bio,
          avatar: user.avatar,
          gender: user.gender
        }
      })))
      .catch((e: Error) => errors.internal(res, e.message))
  }
})

route(router, '/login', {
  post: (req, res) => {
    const schema = Joi.object({
      user: Joi.string().min(3).required(),
      password: Joi.string().min(8).required(),
      stayLoggedIn: Joi.bool()
    })

    const error = schema.validate(req.body)?.error?.details?.[0]?.message

    if (error != null) return errors.badRequest(res, error)

    db.select<DbTypes.Tables.User>('user', { username: req.body.user, email: req.body.user })
      .then(({ data: user }) => {
        if (user === null) return errors.notFound(res, 'User could not be found')
        if (!bcrypt.compareSync(req.body.password, user.password)) return errors.unauthorized(res, 'Password mismatch')

        const expires = new Date().getTime() + (req.body.stayLoggedIn === true ? 90 * 24 * 60 * 60 * 1000 : 5 * 60 * 60 * 1000)
        const session = jwt.sign(
          { sub: user.id },
          (process.env as NodeJS.ProcessEnv & { TOKEN_SECRET: string }).TOKEN_SECRET,
          {
            expiresIn: expires
          }
        )

        res.json({
          token: session,
          data: user
        })
      }).catch((e: Error) => errors.internal(res, e.message))
  }
})

export default router
