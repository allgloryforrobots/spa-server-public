import {JwtPayload} from 'jsonwebtoken'

export interface ErrorResType  {
    message: string
}

export interface OkResType {
    message: 'ok'
}

export type OkOrErrorResType = ErrorResType | OkResType

declare module "express-serve-static-core" {
    interface Request {
        user?: JwtPayload
    }
}