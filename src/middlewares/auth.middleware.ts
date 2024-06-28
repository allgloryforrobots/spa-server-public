import ApiError from 'exceptions/ApiError'
import tokenService from 'services/token.service'
import {Request, Response, NextFunction} from 'express'

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {

    if (req.method === 'OPTIONS') {
        next()
    }

    try {
        const authorizationHeader  = req.headers.authorization as string
        if (!authorizationHeader) {
            return next(ApiError.unauthorized_401('Unauthorized'))
        }

        const accessToken = authorizationHeader.split(' ')[1]
        if (!accessToken) {
            return next(ApiError.unauthorized_401('Unauthorized'))
        }

        const userData = tokenService.validateAccessToken(accessToken)
        if (!userData) next(ApiError.unauthorized_401('Unauthorized'))

        req.user = userData
        next()

    } catch(e) {
        console.log(e)
        next(ApiError.unauthorized_401('Unauthorized'))
    }

}

export default authMiddleware