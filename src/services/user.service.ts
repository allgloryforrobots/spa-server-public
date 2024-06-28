import bcrypt from 'bcrypt'
import {v4} from 'uuid'
import {PoolClient, QueryResult} from 'pg'

import {pool} from 'db/index'
import tokenService from 'services/token.service'
import {UserDTO} from 'dtos/user.dto'
import {logRecord} from 'lib/logger.lib'
import {ActivationLinkStatuses, IUserDataBackend} from 'types/user.types'
import {API_AUTH_ACTIVATE} from 'constants/http.constants'
import mailService from 'services/mail.service'
import ApiError from 'exceptions/ApiError'
import {userFromDbToBackendMapper} from '../mappers/user.dbToBackend.js';

class UserService {

    private async __generateAndSaveTokens(userDto: UserDTO):Promise<{accessToken: string, refreshToken: string}> {
        const tokens = tokenService.generateTokens(userDto)
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return tokens
    }

    public async registration(email: string, password: string, userName: string): Promise<IUserDataBackend> {

        // валидация делается в middleware

        const client: PoolClient = await pool.connect()

        try {

            const userByNamePool: QueryResult = await client.query(
                'SELECT id FROM public.user WHERE username = $1',
                [userName]
            )

            const userByName = userByNamePool.rows[0]

            if (userByName) {
                throw ApiError.badRequest_400('Пользователь с таким именем уже существует')
            }

            const userByEmailPool: QueryResult = await client.query(
                'SELECT id FROM public.user WHERE email = $1',
                [email]
            )

            const userByEmail = userByEmailPool.rows[0]

            if (userByEmail) {
                throw ApiError.badRequest_400('Пользователь с таким почтовым адресом уже существует')
            }

            const hashPassword: string = await bcrypt.hash(password, 3)
            const activationLink: string = v4()

            const userPool: QueryResult = await client.query(
                `INSERT INTO public.user (username, email, password, activation_link, is_activated) 
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, username AS userName, email, is_activated AS isActivated, role`,
                [userName, email, hashPassword, activationLink, false]
            )

            const user = userPool.rows[0]
            const userDto = new UserDTO(userFromDbToBackendMapper(user))
            const tokens = await this.__generateAndSaveTokens(userDto)
            await mailService.sendActivationEmail(email, `${process.env.CLIENT_URL}/${API_AUTH_ACTIVATE}/${activationLink}`)

            return {
                ...tokens,
                user: userDto
            }

        } catch (e) {
            throw e
        } finally {
            client.release()
        }

    }

    public async activate(activationLink: string): Promise<ActivationLinkStatuses | void> {

        const client: PoolClient = await pool.connect()

        try {

            const userPool: QueryResult = await client.query(
                `SELECT id, is_activated FROM public.user WHERE activation_link = $1`,
                [activationLink]
            )

            const user = userPool.rows[0]

            if (!user) return ActivationLinkStatuses.USERNAME_NOT_FOUND
            if (user.is_activated) return ActivationLinkStatuses.YET_ACTIVATED

            await client.query(
                `UPDATE public.user 
                 SET is_activated = true
                 WHERE activation_link = $1`,
                [activationLink]
            )

            logRecord(`Активация аккаунта по ссылке: ${activationLink}`)
            return ActivationLinkStatuses.SUCCESS

        } catch(e) {
            throw e
        } finally {
            client.release()
        }

    }

    public async login(email: string, password: string): Promise<IUserDataBackend> {

        const client: PoolClient = await pool.connect()

        try {

            const userPool: QueryResult = await client.query(
                `SELECT id, email, is_activated, username, role, password FROM public.user WHERE email = $1`,
                [email]
            )
            const user = userPool.rows[0]
            if (!user) throw ApiError.badRequest_400('Неверная почта или пароль')
            const isPassEqual = await bcrypt.compare(password, user.password)
            if (!isPassEqual) throw ApiError.badRequest_400('Неверная почта или пароль')
            const userDto = new UserDTO(userFromDbToBackendMapper(user))
            const tokens = await this.__generateAndSaveTokens(userDto)

            return {
                user: userDto,
                ...tokens
            }

        } catch (e) {
            throw e
        } finally {
            client.release()
        }

    }

    public async logout(refreshToken: string): Promise<void> {
        await tokenService.removeToken(refreshToken)
    }

    public async refresh(refreshToken: string): Promise<IUserDataBackend> {

        const client: PoolClient = await pool.connect()
        try {
            if (!refreshToken) {
                throw ApiError.unauthorized_401('Unauthorized')
            }

            const userData= tokenService.validateRefreshToken(refreshToken)
            const tokenFromDB = await tokenService.findToken(refreshToken)
            if (!userData || !tokenFromDB) {
                throw ApiError.notFound_404('Not Found')
            }

            const userPool: QueryResult = await client.query(
                `SELECT id, username, email, is_activated, role FROM public.user WHERE id = $1`,
                [userData.id]
            )

            const user = userPool.rows[0]
            const userDto = new UserDTO(userFromDbToBackendMapper(user))
            const tokens = await this.__generateAndSaveTokens(userDto)

            return {
                ...tokens,
                user: userDto
            }

        } catch(e) {
            throw e
        } finally {
            client.release()
        }
    }

    public async getAllUsers(): Promise<UserDTO[]> {
        const client: PoolClient = await pool.connect()

        try {
            const usersPool: QueryResult = await client.query(
                `SELECT * from public.user`
            )

            if (!usersPool || usersPool.rows.length === 0) throw ApiError.notFound_404('Not Found')
            return usersPool.rows.map(user => new UserDTO(user))

        } catch(e) {
            throw e
        } finally {
            client.release()
        }

    }

}

const userService = new UserService()
export default userService
