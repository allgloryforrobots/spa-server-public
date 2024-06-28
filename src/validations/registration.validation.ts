import {body} from 'express-validator'
import {PasswordService} from 'services/password.service'

export default function registrationValidation() {
    return [
        body('email').isEmail().withMessage('Укажите корректный email'),
        body('password').isStrongPassword(PasswordService.securePasswordOptions).withMessage(PasswordService.passwordTooltip()),
        body('userName').notEmpty().withMessage('Укажите имя пользователя'),
    ]
}

