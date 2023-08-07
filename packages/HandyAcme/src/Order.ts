import { Account } from "."
import Authorization from "./Authorization"
import ResultOrder, { isResultOrder } from "./Datasets/Result/Order"

export default class Order {

    #account?: Account
    static useAccount(account: Account) {
        const order = new Order
        return order.useAccount(account)
    }
    useAccount(account: Account) {
        this.#account = account
        return this
    }
    get account() {
        if (!this.#account) {
            throw new Error('Account is not specified yet')
        }
        return this.#account
    }

    #url?: string
    get url() {
        if (!this.#url) {
            throw new Error('Order url has not been set')
        } else {
            return this.#url
        }
    }

    #result?: ResultOrder
    get result() {
        if (!this.#result) {
            throw new Error('no order result set')
        }
        return this.#result
    }

    get status() {
        return this.result.status
    }

    async getAuthorizations() {
        return Promise.all(this.result.authorizations.map(url => {
            return Authorization.useAccount(this.account).fromUrl(url)
        }))
    }

    fromResult(result: ResultOrder) {
        this.#result = result
        return this
    }

    /**
     * Fetch from Order Url
     */
    async fromUrl(url: string) {
        this.#url = url
        const acmeRes = await this.account.fetcher.postSignatured(url)
        if (isResultOrder(acmeRes.parsedBody)) {
            this.#result = acmeRes.parsedBody
            return this
        } else {
            throw new Error('Malformed reponse order result:' + JSON.stringify(acmeRes.parsedBody))
        }
    }

    static async create(domains: string[]) {
        return (new Order()).create(domains)
    }
    async create(domains: string[]) {
        const payload = {
            identifiers: domains.map((domain) => {
                return {
                    type: "dns",
                    value: domain,
                }
            }),
        }
        const res = await this.account.fetcher.postSignatured('newOrder', payload)

        if (isResultOrder(res.parsedBody)) {
            this.#result = res.parsedBody
        } else {
            throw new Error('Malformed order response body')
        }
        this.#url = res.location
        return this
    }
}
