import express from 'express'
import { notFound } from '../errors'

import user from './user'

const router = express.Router()

router.use(/\/user?s/, user)
router.get('*', (req, res) => notFound(res, req))

export default router