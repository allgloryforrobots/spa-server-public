import 'dotenv/config'
import express, {Express} from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from 'routes/auth.router'
import errorMiddleware from 'middlewares/error.middleware'

const app: Express = express()
app.use(express.json())
app.use(cookieParser())

const corsConfig = {origin: process.env.CLIENT_URL, credentials: true}

app.use(cors(corsConfig))
// включаем для preflight
app.options('*', cors(corsConfig))

app.use('/api/auth', authRouter)
// обработка ошибок подключается последней
app.use(errorMiddleware)


const start = async () => {

    try {
        app.listen(process.env.PORT, () => {
            console.log('App started at port ' + process.env.PORT)
        })
    } catch (e) {
        console.log(e)
    }
}

await start()