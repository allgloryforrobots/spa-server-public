import {Router} from 'express'
import userController from 'controllers/user.controller'
import authMiddleware from 'middlewares/auth.middleware'
import registrationValidation from "validations/registration.validation"
import loginValidation from 'validations/login.validation'

const authRouter = Router()
authRouter.post('/registration', registrationValidation(), userController.registration)
authRouter.post('/login', loginValidation(), userController.login)
authRouter.post('/logout', userController.logout)
authRouter.get('/activate/:link', userController.activate)
authRouter.get('/refresh', userController.refresh)
authRouter.get('/users', authMiddleware, userController.getAllUsers)

export default authRouter