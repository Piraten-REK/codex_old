import express from 'express'
import * as errors from '../errors'
import db from '../db'
import DbTypes from '../dbTypes'

const router = express.Router()

router.get('/', async (_, res) => {
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
})

export default router