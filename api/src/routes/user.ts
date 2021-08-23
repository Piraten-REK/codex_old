import express from 'express'
import * as errors from '../errors'
import { Database } from '../types'
import Joi from '@hapi/joi'
import jwt from 'jsonwebtoken'
import { config as dotenv } from 'dotenv'
import { resolve as path } from 'path'
import { route } from '../helpers'
import User from '../types/User'

dotenv({ path: path(__dirname, '../../.env') })

const router = express.Router()

route(router, '/', {
  get: (req, res) => {
    // @ts-expect-error
    const auth = req.user as User

    User.getAll()
      .then(users => res.json(
        users.map(user => user.toJSON(auth !== null && (auth.id === user.id || auth.isAdmin)))
      ))
      .catch((e: Error) => errors.internal(res, e.message))
  },
  put: (req, res) => {
    // @ts-expect-error
    const auth = req.user as Database.User
    if (auth == null) return errors.unauthorized(res)
    if (auth.is_admin <= 0) return errors.forbidden(res)

    const schema = Joi.object({
      username: Joi.string().min(1).max(128).required(),
      displayName: Joi.string().min(1).max(512).required(),
      email: Joi.string().email().max(768).required(),
      password: Joi.string().min(8).required(), // ToDo: Create Password if none provided
      bio: Joi.string(),
      gender: Joi.string().regex(/^[fma]$/).required(),
      isActive: Joi.boolean(),
      isAdmin: Joi.boolean()
    })

    const error = schema.validate(req.body)?.error?.details?.[0]?.message

    if (error !== undefined) return errors.badRequest(res, error)

    User.createNew(
      req.body.username,
      req.body.displayName,
      req.body.email,
      req.body.password,
      req.body.bio ?? undefined,
      req.body.gender,
      req.body.isActive ?? true,
      req.body.isAdmin ?? false
    )
      .then(user => res.status(201).json(user.toJSON(true)))
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

    User.getByUsernameOrEmail(req.body.user)
      .then(user => {
        if (user === null) return errors.notFound(res, 'User could not be found')
        if (user.checkPassword(req.body.password)) return errors.unauthorized(res, 'Password mismatch')

        const expires = (req.body.stayLoggedIn === true ? 90 * 24 : 5) * 60 * 60
        const session = jwt.sign(
          { sub: user.id },
          (process.env as NodeJS.ProcessEnv & { TOKEN_SECRET: string }).TOKEN_SECRET,
          {
            expiresIn: expires
          }
        )

        res.json({
          token: session,
          data: user.toJSON(true)
        })
      })
      .catch((e: Error) => errors.internal(res, e.message))
  }
})

route(router, '/:id', {
  get: (req, res) => {
    if (!/\d+/.test(req.params.id)) return errors.badRequest(res, '`userId` must be numeric')

    User.getById(parseInt(req.params.id))
      .then(user => {
        if (user === null) return errors.notFound(res, `User with id \`${req.params.id}\` could not be found`)

        // @ts-expect-error
        const auth = req.user as User

        res.json(user.toJSON(auth !== null && (auth.id === user.id || user.isAdmin)))
      })
      .catch((e: Error) => errors.internal(res, e.message))
  },
  patch: (req, res) => {
    // @ts-expect-error
    const auth = req.user as Database.User
    if (auth == null) return errors.unauthorized(res)
    if (auth.is_admin <= 0) return errors.forbidden(res)
    return errors.error(res, 'Work in Progress', 501, 'Not Implemented')
  },
  delete: (req, res) => {
    // @ts-expect-error
    const auth = req.user as Database.User
    if (auth == null) return errors.unauthorized(res)
    if (auth.is_admin <= 0) return errors.forbidden(res)
    return errors.error(res, 'Work in Progress', 501, 'Not Implemented')
  }
})

route(router, '/:id/avatar', {
  get: (req, res) => {
    if (!/\d+/.test(req.params.id)) return errors.badRequest(res, '`userId` must be numeric')

    User.getById(parseInt(req.params.id))
      .then(user => {
        if (user === null) return errors.notFound(res, `User with id \`${req.params.id}\` could not be found`)
        if (user.avatar === undefined) return res.status(204).end()

        const data = 'base64' in req.query ? user.avatar.base64 : user.avatar.data

        if ('download' in req.query) res.header('Content-Disposition', `attachment; filename="${user.avatar.filename.slice(user.avatar.filename.lastIndexOf('/') + 1)}"`)
        res.type('base64' in req.query ? 'text/plain' : user.avatar.mime).send(data)
      })
      .catch((e: Error) => errors.internal(res, e.message))
  },
  put: (_, res) => errors.error(res, 'Worl in Progress', 501, 'Not Implemented'),
  delete: (_, res) => errors.error(res, 'Worl in Progress', 501, 'Not Implemented')
})

export default router
