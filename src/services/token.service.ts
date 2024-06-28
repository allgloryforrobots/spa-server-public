import jwt from 'jsonwebtoken'
import {pool} from 'db'
import {IUser} from 'types/user.types'
import {PoolClient, QueryResult} from 'pg'
import {UserDTO} from 'dtos/user.dto'

class TokenService {

    public generateTokens(user: UserDTO): {accessToken: string, refreshToken: string} {
        const plainObject = {...user};
        const accessToken: string = jwt.sign(plainObject, process.env.JWT_ACCESS_SECRET as string, { expiresIn: '30m' })
        const refreshToken: string = jwt.sign(plainObject, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '30d' })

        return {
            accessToken,
            refreshToken
        }
    }

    public async saveToken(userId: number, refreshToken: string): Promise<void | never> {

        const client: PoolClient = await pool.connect()

        try {

            const tokenDataPool: QueryResult = await client.query(
                `SELECT * FROM public.token WHERE user_id = $1`,
                [userId]
            )
            const tokenData: IUser | undefined = tokenDataPool.rows[0]

            if (tokenData) {

                await client.query(
                    `UPDATE public.token 
                    SET refresh_token = $1
                    WHERE user_id = $2`,
                    [refreshToken, userId]
                )

            } else {

                await client.query(
                    `INSERT INTO public.token (user_id, refresh_token) VALUES ($1, $2)`,
                    [userId, refreshToken]
                )

            }

        } catch (e) {
            throw e
        } finally {
            client.release()
        }

    }

    public async removeToken(refreshToken: string): Promise<void> {
        const client: PoolClient = await pool.connect()

        try {
            await client.query(
                `DELETE FROM public.token WHERE refresh_token = $1`,
                [refreshToken]
            )

        } catch (e) {
            throw e
        } finally {
            client.release()
        }
    }

    public async findToken(refreshToken: string) {

        const client: PoolClient = await pool.connect()

        try {
            const tokenDataPool = await client.query(
                `SELECT refresh_token AS refreshToken FROM public.token WHERE refresh_token = $1`,
                [refreshToken]
            )

            const tokenData: string | undefined = tokenDataPool.rows[0]

            if (!tokenData) return null
            else return tokenData

        } catch (e) {
            return null
        } finally {
            client.release()
        }
    }

    public validateAccessToken(token: string): jwt.JwtPayload {
        return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as jwt.JwtPayload
    }

    public validateRefreshToken(token: string): jwt.JwtPayload {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as jwt.JwtPayload
    }

}

const tokenService = new TokenService()
export default tokenService
