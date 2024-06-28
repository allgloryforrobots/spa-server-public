import {NextFunction, Request, Response} from 'express'
import {REFRESH_TOKEN} from 'constants/http.constants'
import userService from 'services/user.service'
import {ActivationLinkStatuses, IUserDataBackend, IUserDataClient} from 'types/user.types'
import ApiError from 'exceptions/ApiError'
import {validationResult, Result, ValidationError} from 'express-validator'
import {UserDTO} from 'dtos/user.dto';

class UserController {

    public async registration(req: Request, res: Response, next: NextFunction) {

        try {

            const errors: Result<ValidationError> = validationResult(req)
            if (!errors.isEmpty()){
                const errorsArr = errors.array()
                throw ApiError.badRequest_400(
                    errorsArr.map(el => el.msg).join('. \n'),
                    errorsArr
                )
            }

            const {email, password, userName} = req.body

            const userData: IUserDataBackend | undefined = await userService.registration(email, password, userName)
            if (!userData) throw ApiError.internal_500('Не удалось зарегистрировать пользователя')
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000})
            return res.status(200).json({
                accessToken: userData.accessToken,
                user: userData.user
            })

        } catch(e) {
            next(e)
        }

    }

    public async login(req: Request, res: Response, next: NextFunction)  {

        try {

            const errors: Result<ValidationError> = validationResult(req)
            if (!errors.isEmpty()) {
                const errorsArr = errors.array()
                throw ApiError.badRequest_400(
                    errorsArr.map(el => el.msg).join('. \n'),
                    errorsArr
                )
            }

            const {email, password} = req.body
            const userData: IUserDataBackend | undefined = await userService.login(email, password)
            if (!userData.refreshToken) throw ApiError.internal_500('Не удалось авторизоваться')
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000})
            return res.status(200).json({
                accessToken: userData.accessToken,
                user: userData.user
            })

        } catch(e) {
            next(e)
        }

    }

    public async logout(req: Request, res: Response, next: NextFunction) {

        try {
            const token: string = req.cookies[REFRESH_TOKEN]
            await userService.logout(token)
            res.clearCookie(REFRESH_TOKEN)
            return res.status(200).json({message: 'ок'})
        } catch(e) {
            next(e)
        }

    }

    public async activate(req: Request, res: Response, next: NextFunction) {

        try {
            const link: string =  req.params.link
            const status: ActivationLinkStatuses | void = await userService.activate(link)
            let params: string = '/'

            if (status === ActivationLinkStatuses.YET_ACTIVATED) {

            } else if (status === ActivationLinkStatuses.USERNAME_NOT_FOUND) {
                // на фронтенд возвращаем ошибку что-то пошло не так!
                // минимум информации потенциальным хакерам
            } else if (status === ActivationLinkStatuses.SUCCESS) {
                // ничего не делаем, резервируем блок на будущее
            }

            return res.redirect(req.url + params)
        } catch(e) {
            next(e)
        }

    }

    public async refresh(req: Request, res: Response, next: NextFunction) {

        try {
            const refreshToken: string = req.cookies[REFRESH_TOKEN]
            const userData = await userService.refresh(refreshToken)
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000})
            return res.status(200).json({
                accessToken: userData.accessToken,
                user: userData.user
            })
        } catch(e) {
            next(e)
        }

    }

    public async getUser(req: Request, res: Response, next: NextFunction) {
        try {

        } catch(e) {
            next(e)
        }
    }

    public async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users: UserDTO[] | undefined = await userService.getAllUsers()
            if (!users) throw ApiError.notFound_404('No users found')
            return res.status(200).json(users)
        } catch(e) {
            next(e)
        }
    }

}

const userController = new UserController()
export default userController