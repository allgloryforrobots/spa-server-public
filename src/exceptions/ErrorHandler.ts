import {PoolClient} from 'pg'

class ErrorHandler {

    dbCatch(e: Error, client: PoolClient): void {
        client.release()
        throw e
    }

}

export const errorHandler = new ErrorHandler()