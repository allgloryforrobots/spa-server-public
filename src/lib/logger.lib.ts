import winston from 'winston'
import DailyRotateFile from "winston-daily-rotate-file"

const transport = new DailyRotateFile({
    filename: './logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
})

//noinspection Duplicates
transport.on('error', error => {
    // log or handle errors here
})

transport.on('rotate', (oldFilename, newFilename) => {
    // do something fun
})


const {combine, timestamp, json} = winston.format

const logger = winston.createLogger({
    level: "info",
    format: combine(timestamp(), json()),
    transports: [
        new winston.transports.Console(),
        transport,
    ]

})

const logRecord = (message: string) => logger.info(message)
const logError = (err: Error) => {
    logger.error('MESSAGE: ' + err.message + ' STACK: ' + err.stack)
}

export { logger, logRecord, logError }

