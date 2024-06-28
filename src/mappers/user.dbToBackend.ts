import {IDatabaseUser, IUser} from 'types/user.types'

export function userFromDbToBackendMapper(user: IDatabaseUser): IUser {
    return {
        id: user.id,
        email: user.email,
        password: user.password,
        activationLink: user.activation_link,
        isActivated: user.is_activated,
        userName: user.username,
        role: user.role
    }
}