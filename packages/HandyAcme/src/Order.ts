import { Account } from "."
import Authorization from "./Authorization"
import CertificationSigningRequest from "./CertificationSigningRequest"
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

    get finalizeUrl() {
        return this.result.finalize
    }

    get certificateUrl() {
        return this.result.certificate
    }

    #result?: ResultOrder
    get result(): ResultOrder {
        if (!this.#result) {
            throw new Error('no order result set')
        }
        return this.#result
    }
    set result(result: unknown) {
        if (isResultOrder(result)) {
            this.#result = result
        } else {
            throw new Error('Malformed order response body')
        }
    }

    get domains() {
        return this.result.identifiers.map(identifier => identifier.value)
    }

    get status() {
        return this.result.status
    }

    async fetchAuthorizations() {
        return Promise.all(this.result.authorizations.map(url => {
            return Authorization.useAccount(this.account).fromUrl(url)
        }))
    }

    async fetchCertificate() {
        if (!this.certificateUrl) {
            throw new Error('There is no certificate url in order yet')
        }
        return this.account.fetcher.withOptions({
            headers: {
                'accept': 'application/pem-certificate-chain',
                'content-type': 'application/jose+json'
            }
        }).getSignatured(this.certificateUrl)
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
        const acmeRes = await this.account.fetcher.getSignatured(url)
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
        this.result = res.parsedBody
        this.#url = res.location
        return this
    }

    async updateCsr(csr: CertificationSigningRequest) {
        const acmeRes =  await this.account.fetcher.postSignatured(this.finalizeUrl, {
            csr: csr.toString()
        })
        this.result = acmeRes.parsedBody
        return this
    }
}
