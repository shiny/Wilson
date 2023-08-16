import cookie from 'cookie'
import Macroable from '@poppinss/macroable'

export default class SodaRequest extends Macroable {

    constructor(public request: Request) {
        super()
        const rawCookie = this.request.headers.get('cookie')
        if(rawCookie) {
            this.cookies = cookie.parse(rawCookie)
        }
    }
    cookies?: Record<string, string>
    plainCookie(name: string) {
        if (this.cookies && name in this.cookies) {
            return this.cookies[name]
        }
        return false
    }
    cookie<T = unknown>(name: string) {
        const value = this.plainCookie(name)
        if (value) {
            return JSON.parse(value) as T
        }
        return false
    }

    get method() {
        return this.request.method
    }

    toWebRequest() {
        return this.request
    }

    static from(request: Request) {
        return new SodaRequest(request)
    }
}
