import ApiError from "exceptions/ApiError"
import {Response, Request, NextFunction} from 'express'
import {logError} from 'lib/logger.lib'

const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {

    logError(err)

    if (err instanceof ApiError) {
        return res.status(500).json({message: err.message, errors: err.errors})
    }

    return res.status(500).json({message: 'Что-то пошло не так', errors: [{message: err.message}]})
}

export default errorMiddleware