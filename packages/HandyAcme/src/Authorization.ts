import { Account } from "."
import Challenge from "./Challenge"
import ResultAuthorization, { isAuthorization } from "./Datasets/Result/Authorization"
import ResultChallenge from "./Datasets/Result/Challenge"

export default class Authorization {

    #url?: string
    get url() {
        if (!this.#url) {
            throw new Error('authz\'s url has not been set')
        }
        return this.#url
    }
    set url(url: string) {
        this.#url = url
    }

    #account?: Account
    static useAccount(account: Account) {
        const authz = new Authorization()
        authz.account = account
        return authz
    }

    get account() {
        if (!this.#account) {
            throw new Error('Authz\'s account has not been set')
        }
        return this.#account
    }

    set account(account: Account) {
        this.#account = account
    }

    get status() {
        return this.result.status
    }

    #result?: ResultAuthorization
    get result() {
        if (!this.#result) {
            throw new Error('Authorization result has not been set yet.')
        }
        return this.#result
    }

    get identifierType() {
        return this.result.identifier.type
    }

    get identifierValue() {
        return this.result.identifier.value
    }

    /**
     * is it a wildcard ceritifcate?
     */
    get isWildcard() {
        return this.#result?.wildcard ?? false
    }

    /**
     * a challenge dns name
     * `_acme-challenge.example.org`
     */
    get dnsChallengeName() {
        if (!this.dnsChallenge) {
            throw new Error('Challenge could not verified by DNS')
        }
        return `_acme-challenge.${this.identifierValue}`
    }

    /**
     * Fetch from Authz Url
     */
    async fromUrl(url: string) {
        this.url = url
        const acmeRes = await this.account.fetcher.getSignatured(url)
        if (!isAuthorization(acmeRes.parsedBody)) {
            throw new Error(`${url} Responsed data is a malformed Authorization result`)
        } else {
            this.#result = acmeRes.parsedBody
            return this
        }
        // if (isResultOrder(acmeRes.parsedBody)) {
        //     this.#result = acmeRes.parsedBody
        //     return this
        // } else {
        //     throw new Error('Malformed reponse order result:' + JSON.stringify(acmeRes.parsedBody))
        // }
    }

    getChallenges() {
        return this.result.challenges.map(challenge => Challenge
            .useAccount(this.account)
            .fromResult(challenge)
        )
    }

    getFiltedChallenge(filter: ResultChallenge['type']) {
        return this.getChallenges().find(challenge => challenge.is(filter))
    }

    get dnsChallenge() {
        return this.getFiltedChallenge('dns-01')
    }
    get httpChallenge() {
        return this.getFiltedChallenge('http-01')
    }
    get tlsAlpnChallenge() {
        return this.getFiltedChallenge('tls-alpn-01')
    }
}

