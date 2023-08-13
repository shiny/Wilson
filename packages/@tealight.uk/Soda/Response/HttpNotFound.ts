export default class ResponseNotFound extends Response {
    constructor(body?: string) {
        super(body ?? 'Http Not Found', {
            status: 404
        })
    }
}
