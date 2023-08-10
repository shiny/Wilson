import Account, { JoseBody, CreateAccountOptions, CreateAccountOptionsWithEab } from "./Account"
import AcmeResponse from "./AcmeResponse"
import Directory from "./Directory"
import Fetch from "./Fetch"
import ResultDirectory from "./Datasets/Result/Directory"
export type DirectoryResourceType = keyof Omit<ResultDirectory, 'meta'>

export default class AcmeFetch extends Fetch {

    public requestContentType = 'application/jose+json'
    
    get staticSelf() {
        return this.constructor as typeof AcmeFetch
    }

    #directory?: Directory
    useDirectory(directory: Directory) {
        this.#directory = directory
        return this
    }
    static useDirectory(directory: Directory) {
        return (new AcmeFetch).useDirectory(directory)
    }
    get directory() {
        if (!this.#directory) {
            throw new Error('Directory has not been set in AcmeFetch')
        }
        return this.#directory
    }

    isResourceType(url: string): url is DirectoryResourceType {
        return url in this.directory.result
    }

    /**
     * Transform resourceTypes to url from directory
     * @param type url or resourceType e.g. newOrder, newAccount
     * @return url
     */
    transformResourceTypeToUrl(type: DirectoryResourceType): string;
    transformResourceTypeToUrl(type: string): string;
    transformResourceTypeToUrl(type: string): string {
        if (this.isResourceType(type)) {
            if (this.directory.result[type]) {
                return this.directory.result[type] as string
            } else {
                throw new Error(`AcmeFetch: ${type}'s url is empty`)
            }
        } else {
            return type
        }
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
        return this.postSignatured(url, '')
    }

    private async postJose(url: string, joseBody: JoseBody) {
        const res = await this.fetch(url, {
            method: "POST",
            body: JSON.stringify(joseBody),
        })
        const acmeRes = await AcmeResponse.from(res).parse()
        this.cacheNonceFromResponse(acmeRes)
        if (acmeRes.isProblemJson()) {
            acmeRes.throwError() 
        }
        return acmeRes
    }

    postSignatured(url: DirectoryResourceType, payload?: unknown): Promise<AcmeResponse>;
    postSignatured(url: string, payload?: unknown): Promise<AcmeResponse>;
    async postSignatured(url: string, payload: any = {}): Promise<AcmeResponse> {
        const nonce = await this.nonce()
        url = this.transformResourceTypeToUrl(url)
        const sinaturedBody = await this.account.makeRequestBody({ url, nonce }, payload)
        return this.postJose(url, sinaturedBody)
    }

    /**
     * Only for account registration
     * @param url 
     * @param payload 
     * @returns 
     */
    async postSignaturedUsingKey(url: string, payload: CreateAccountOptions | CreateAccountOptionsWithEab) {
        const nonce = await this.nonce()
        url = this.transformResourceTypeToUrl(url)
        const sinaturedBody = await this.account.makeRequestBodyUsingKey({
            nonce,
            url,
        }, payload)
        return this.postJose(url, sinaturedBody)
    }
}
