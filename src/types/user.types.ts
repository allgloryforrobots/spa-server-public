import {UserDTO} from 'dtos/user.dto.js'

// активирован иди аккаунт пользователя?
export enum ActivationLinkStatuses  {
    YET_ACTIVATED = 'YET_ACTIVATED',
    SUCCESS = 'SUCCESS',
    USERNAME_NOT_FOUND = 'USERNAME_NOT_FOUND'
}

// пользователь на бэкенде
export interface IUser {
    id: number
    email: string
    password: string
    activationLink: string
    isActivated: boolean
    userName: string
    role: UserRolesEnum
}

export interface IDatabaseUser {
    id: number
    email: string
    password: string
    activation_link: string
    is_activated: boolean
    username: string
    role: UserRolesEnum
}

// отправляется на клиент
export interface IUserDataClient {
    user: UserDTO
    accessToken: string
}

// возвращается из user.service
export interface IUserDataBackend extends IUserDataClient {
    refreshToken: string
}

export enum UserRolesEnum {
    ADMIN = 'ADMIN',
    USER = 'USER'
}