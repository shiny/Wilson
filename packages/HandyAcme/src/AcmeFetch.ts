import Account, { CapsuledRequestBody, CreateAccountOptions, CreateAccountOptionsWithEab } from "./Account";
import AcmeResponse from "./AcmeResponse";
import Directory from "./Directory";
import Fetch from "./Fetch";

export default class AcmeFetch extends Fetch {

    public requestContentType = 'application/jose+json'
    
    public directory?: Directory
    useDirectory(directory: Directory) {
        this.directory = directory
        return this
    }
    static useDirectory(directory: Directory) {
        return (new AcmeFetch).useDirectory(directory)
    }

    #account?: Account
    useAccount(account: Account) {
        this.#account = account
        return this
    }
    get account() {
        if (!this.#account) {
            throw new Error('No account set')
        }
        return this.#account
    }

    #cachedNonces: string[] = []
    async nonce() {
        if (!this.directory) {
            throw new Error('Directory did not set yet')
        }
        const cachedNonce = this.#cachedNonces.pop()
        if (cachedNonce) {
            return cachedNonce
        }
        const res = await this.fetch(this.directory?.newNonce, {
            method: 'HEAD',
        })
        const replayNonce = res.headers.get('replay-nonce')
        if (!replayNonce) {
            throw new Error(`Failed to get "replay-nonce"`)
        } else {
            return replayNonce
        }
    }

    cacheNonceFromResponse(res: AcmeResponse) {
        if (res.replayNonce) {
            this.#cachedNonces.push(res.replayNonce)
        }
    }

    async getSignatured(url: string) {
        return this.postSignatured(url)
    }

    private async postCapsuledRequestBody(url: string, nonce: string, sinaturedBody: CapsuledRequestBody) {
        const res = await this.fetch(url, {
            method: "POST",
            body: JSON.stringify(sinaturedBody),
        })
        const acmeRes = await AcmeResponse.from(res).parse()
        this.cacheNonceFromResponse(acmeRes)
        if (acmeRes.isProblemJson()) {
            acmeRes.throwError() 
        }
        return acmeRes
    }

    async postSignatured(url: string, payload: any = '') {
        const nonce = await this.nonce()
        const sinaturedBody = await this.account.makeRequestBody({ url, nonce }, payload)
        return this.postCapsuledRequestBody(url, nonce, sinaturedBody)
    }

    /**
     * Only for account registration
     * @param url 
     * @param payload 
     * @returns 
     */
    async postSignaturedUsingKey(url: string, payload: CreateAccountOptions | CreateAccountOptionsWithEab) {

        console.log('dokidoki', url, payload)
        const nonce = await this.nonce()
        const sinaturedBody = await this.account.makeRequestBodyUsingKey({
            nonce,
            url,
        }, payload)
        return this.postCapsuledRequestBody(url, nonce, sinaturedBody)
    }
}
