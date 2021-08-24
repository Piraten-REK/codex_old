import { Router, Request, Response } from 'express'
import { methodNotAllowed } from './errors'
import { config as dotenv } from 'dotenv'
import { resolve as path } from 'path'

dotenv({ path: path(__dirname, '../env') })

const methods: ['get', 'post', 'put', 'patch', 'delete'] = ['get', 'post', 'put', 'patch', 'delete']

export const route = (router: Router, path: string, handlers: routeHandler): void => {
  const allowed = Object.keys(handlers).map(method => method.toUpperCase()).join(', ') + ', HEAD'

  methods.forEach(method => {
    router[method](path, (req: Request, res: Response) => {
      res.header('Allow', allowed)
      if (method in handlers) handlers[method]?.(req, res)
      else methodNotAllowed(res, req)
    })
  })
}

type expFunc = (req: Request, res: Response) => void

interface routeHandler {
  get?: expFunc
  post?: expFunc
  put?: expFunc
  patch?: expFunc
  delete?: expFunc
}
