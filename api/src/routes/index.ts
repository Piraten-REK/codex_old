import express from 'express'
import { notFound } from '../errors'

const router = express.Router()

router.get('*', (req, res) => notFound(res, req))

export default router