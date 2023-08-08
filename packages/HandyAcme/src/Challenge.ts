import { Account } from "."
import ResultChallenge, {
    challengeStatues,
    challengeTypes
} from "./Datasets/Result/Challenge"
import { sha256 } from "./Key"

export default class Challenge {

    #account?: Account
    get account() {
        if (!this.#account) {
            throw new Error('No account set on Challenge')
        }
        return this.#account
    }
    set account(account: Account) {
        this.#account = account
    }

    static useAccount(account: Account) {
        const challenge = new Challenge
        challenge.account = account
        return challenge
    }

    #result?: ResultChallenge
    get result() {
        if (!this.#result) {
            throw new Error('No result set on Challenge')
        }
        return this.#result
    }

    set result(result: ResultChallenge) {
        this.#result = result
    }

    fromResult(result: ResultChallenge) {
        this.result = result
        return this
    }

    async fromUrl(url: string) {
        const acmeRes = await this.account.fetcher.getSignatured(url)
        this.result = acmeRes.parsedBody
        return this
    }

    get url() {
        return this.result.url
    }

    is(type: ResultChallenge['type']): boolean;
    is(status: ResultChallenge['status']): boolean;
    is(propValue: string): boolean {
        if (Array.from<string>(challengeStatues).includes(propValue)) {
            return this.result.status === propValue
        }
        if (Array.from<string>(challengeTypes).includes(propValue)) {
            return this.result.type === propValue
        }
        return false
    }

    get token() {
        return this.result.token
    }

    async computeVerifyToken() {
        const jwkThumbprint = await this.account.exportPublicThumbprint()
        const signString = `${this.token}.${jwkThumbprint}`
        if (this.is('http-01')) {
            return signString
        } else if (this.is('dns-01')) {
            return sha256(signString)
        } else {
            throw new Error(
                `Challenge type ${this.result.type} is not implemented`,
            )
        }
    }

    /**
     * Note: You must finish the chanllenge before verify
     */
    async verify() {
        const acmeRes = await this.account.fetcher.postSignatured(this.url)
        this.#result = acmeRes.parsedBody
        console.log(acmeRes.parsedBody)
        return this
    }
}
