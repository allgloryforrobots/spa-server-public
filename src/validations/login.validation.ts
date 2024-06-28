import {body} from 'express-validator'

export default function loginValidation() {
    return [
        body('email').isEmail().withMessage('Укажите корректный email'),
        body('password').notEmpty().withMessage('Укажите пароль')
    ]
}