export default class ApiError extends Error {

    status: number
    errors: Array<any>

    constructor(status: number, message: string, errors: Array<any> = []) {
        super(message)
        this.status = status
        this.errors = errors
    }

    static badRequest_400(message: string, errors: Array<any> = []): ApiError {
        return new ApiError(400, message, errors)
    }

    static unauthorized_401(message: string, errors: Array<any> = []): ApiError {
        return new ApiError(401, message, errors)
    }

    /** Cервер понял запрос, но отказывается его авторизовать */
    static forbidden_403(message: string, errors: Array<any> = []): ApiError {
        return new ApiError(403, message, errors)
    }

    static notFound_404(message: string, errors: Array<any> = []): ApiError {
        return new ApiError(404, message, errors)
    }

    static internal_500(message: string, errors: Array<any> = []): ApiError {
        return new ApiError(500, message, errors)
    }

}