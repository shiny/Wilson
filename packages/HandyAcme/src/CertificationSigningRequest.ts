import { OctetString, PrintableString, Utf8String } from "asn1js"
import {
    Attribute,
    AttributeTypeAndValue,
    CertificationRequest,
    Extension,
    Extensions,
    GeneralName,
    GeneralNames
} from "pkijs"
import { Key, Order } from "."

export function chunkString(str: string, limit = 64) {
    if (!str) {
        throw new Error('string is null')
    }
    const reg = new RegExp(`.{1,${limit}}`, "g")
    const chunked = str.match(reg)
    if (!chunked) {
        return ''
    } else {
        return chunked.join("\n")
    }
}

export default class CertificateSigningRequest {

    #domains: string[] = []
    get domains() {
        if (!this.#domains) {
            throw new Error('Domains are required for a CSR')
        }
        return this.#domains
    }
    for(domains: string[] | string) {
        if (typeof domains === 'string') {
            this.#domains = [domains]
        } else {
            this.#domains = domains
        }
    }
    
    #order?: Order
    set order(order: Order) {
        this.#order = order
    }
    get order() {
        if(!this.#order) {
            throw new Error('No order set on CSR Object')
        }
        return this.#order
    }
    static fromOrder(order: Order) {
        const csr = new CertificateSigningRequest
        csr.for(order.domains)
        csr.order = order
        return csr
    }

    #key?: CryptoKeyPair
    useKey(key: CryptoKeyPair) {
        this.#key = key
    }
    get key() {
        if (!this.#key) {
            throw new Error('No key set on CSR')
        }
        return this.#key
    }
    set key(key: CryptoKeyPair) {
        this.#key = key
    }
    hasKey() {
        return !!this.#key
    }

    async exportPkcs8PrivateKey() {
        const exportedKey = await crypto.subtle.exportKey('pkcs8', this.key.privateKey)
        const keyString = Buffer.from(exportedKey).toString("base64")
        return (
            "-----BEGIN PRIVATE KEY-----\n" +
            chunkString(keyString) +
            "\n" +
            "-----END PRIVATE KEY-----"
        )
    }

    #csr?: CertificationRequest
    get csr() {
        if (!this.#csr) {
            throw new Error('CSR has not been generated yet')
        }
        return this.#csr
    }
    set csr(csr: CertificationRequest) {
        this.#csr = csr
    }

    async create() {
        if (!this.hasKey()) {
            const certKey = await Key.generate('ES256', { extractable: true, keyUsages: ['sign']})
            this.key = certKey.exportCryptoKeyPair()
        }
        const algorithm = 'SHA-256'
        const csr = new CertificationRequest()
        csr.version = 0

        const data = csr.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHexView
        const subjectKeyIdentifier = await crypto.subtle.digest(algorithm, data)

        const alternativeNames = new GeneralNames({
            names: this.domains.map(domain => new GeneralName({
                type: 2,
                value: domain
            }))
        })

        const extensions = new Extensions({
            extensions: [
                new Extension({
                    // id-ce-subjectKeyIdentifier
                    extnID: '2.5.29.14',
                    critical: false,
                    extnValue: new OctetString({
                        valueHex: subjectKeyIdentifier,
                    }).toBER(false)
                }),
                new Extension({
                    extnID: '2.5.29.17',
                    critical: false,
                    extnValue: alternativeNames.toSchema().toBER(false)
                })
            ]
        })
        csr.attributes = [
            new Attribute({
                type: "1.2.840.113549.1.9.14",
                values: [ extensions.toSchema() ]
            })
        ]
        await csr.subjectPublicKeyInfo.importKey(this.key.privateKey)
        await csr.sign(this.key.privateKey, 'SHA-256')
        this.csr = csr
        return this
    }

    async submit() {
        return this.order.updateCsr(this)
    }

    toString() {
        return this.csr.toString('base64url')
    }
}
