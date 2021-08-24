import express, { Request, Response, NextFunction } from 'express'
import { notFound, badRequest } from '../errors'

import user from './user'

const router = express.Router()

router.use(/\/users?/, user)
router.get('*', (req, res) => notFound(res, req))
router.use((err: Error, _: Request, res: Response, __: NextFunction) => badRequest(res, err.message ?? err))

export default router
