import {IUser, UserRolesEnum} from 'types/user.types'

export class UserDTO {

    id: number
    isActivated: boolean
    userName: string
    role: UserRolesEnum

    constructor(model: IUser) {
        this.id = model.id
        this.isActivated = model.isActivated
        this.userName = model.userName
        this.role = model.role
    }

}