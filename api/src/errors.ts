import { Request, Response } from 'express'

export const error = (res: Response, reason: string, status: number, msg: string): void => { 
    res.status(status).json({
        error: status,
        reason: reason,
        msg: msg
    })
}

export const badRequest = (res: Response, reason: string) => error(res, reason, 400, 'Bad Request')

export const notFound = (res: Response, reason: string|Request) => error(
    res,
    typeof reason === 'string'
        ? reason
        : `The ressource at \`${reason.path}\` could not be found`,
    404,
    'Not Found'
)

export const internal = (res: Response, reason: string = 'Whooops … Something went wrong') => error(res, reason, 500, 'Internal Server Error')
