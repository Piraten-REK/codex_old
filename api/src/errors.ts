import { Request, Response } from 'express'

export const error = (res: Response, reason: string, status: number, msg: string): void => {
  res.status(status).json({
    error: status,
    reason: reason,
    msg: msg
  })
}

export const badRequest = (res: Response, reason: string): void => error(res, reason, 400, 'Bad Request')

export const unauthorized = (res: Response, reason: string = 'User not logged in'): void => error(res, reason, 401, 'Unauthorized')

export const forbidden = (res: Response, reason: string = 'Unsufficient privileges'): void => error(res, reason, 403, 'Forbidden')

export const notFound = (res: Response, reason: string|Request): void => error(
  res,
  typeof reason === 'string'
    ? reason
    : `The ressource at \`${reason.path}\` could not be found`,
  404,
  'Not Found'
)

export const methodNotAllowed = (res: Response, req: Request): void => error(res, `${req.method} not allowed here`, 405, 'Method not allowed')

export const internal = (res: Response, reason: string = 'Whooops … Something went wrong'): void => error(res, reason, 500, 'Internal Server Error')
