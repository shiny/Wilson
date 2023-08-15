import cookie, { CookieSerializeOptions } from 'cookie'

export default class SodaResponse {
    public headers = new Headers()
    public rawContent: string = ''
    public contentType: string = ''
    public httpStatus?: number
    public httpStatusText?: string
    
    header(name: string, value: string) {
        this.headers.set(name, value)
        return this
    }
    append(name: string, value: string) {
        this.headers.append(name, value)
        return this
    }
    safeHeader(name: string, value: string) {
        if (!this.headers.has(name)) {
            this.headers.set(name, value)
        }
        return this
    }
    removeHeader(name: string) {
        this.headers.delete(name)
        return this
    }
    getHeader(name: string) {
        return this.headers.get(name)
    }

    plainCookie(name: string, value: string, options?: CookieSerializeOptions) {
        this.headers.append('set-cookie', cookie.serialize(name, value, options))
    }
    cookie(name: string, value: string | number | object, options?: CookieSerializeOptions) {
        this.plainCookie(name, JSON.stringify(value), options)
    }
    status(status: number, text?: string) {
        this.httpStatus = status
        this.httpStatusText = text
        return this
    }
    safeStatus(status: number) {
        if (!Number.isInteger(this.httpStatus)) {
            this.httpStatus = status
        }
        return this
    }
    send(content: string | number | void | Object, status?: number) {
        if (status) {
            this.status(status)
        }
        const type = typeof content
        if (['string', 'number', 'void'].includes(type)) {
            this.rawContent = content ? content.toString() : ''
            this.contentType = 'text/plain'
        } else {
            this.rawContent = JSON.stringify(content)
            this.contentType = 'application/json'
        }
        return this.toWebResponse()
    }
    static send(content: Parameters<SodaResponse['send']>[0], status?: number) {
        const res = new SodaResponse
        return res.send(content, status)
    }
    toWebResponse() {
        if (this.contentType) {
            this.headers.set('content-type', this.contentType)
        }
        const status = this.httpStatus ?? 200
        return new Response(this.rawContent, {
            headers: this.headers,
            status,
            statusText: this.httpStatusText
        })
    }
}
