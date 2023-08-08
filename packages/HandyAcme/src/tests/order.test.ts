import { test, expect } from 'bun:test'
import Order from '../Order'
import { Account, Directory } from '..'
import CertificateSigningRequest from '../CertificationSigningRequest'

test('Order', async () => {
    // const directory = await Directory.from('LetsEncrypt', 'staging')
    // const account = await Account.useDirectory(directory).create({
    //     termsOfServiceAgreed: true
    // })
    // const privateKey = await account.exportPrivateKey()
    // console.log(privateKey)
    // console.log(account.url)
    // const order = await Order.useAccount(account).create(['*.miaomiao.party', 'miaomiao.party'])
    // // console.log(order.result)
    // const authzs = await order.getAuthorizations()
    // console.log(await Promise.all(authzs.map(async authz => {
    //     const verifyToken = await authz.dnsChallenge?.computeVerifyToken()
    //     return `${authz.dnsChallengeName} => ${verifyToken}`
    // })))
    // //console.log(await Promise.all(authzs.map(authz => authz.dnsChallenge?.computeVerifyToken())))
})

test(('Restore Order'), async () => {
    const accountUrl = 'https://acme-staging-v02.api.letsencrypt.org/acme/acct/113931694'

    // WARNING: do NOT use this key in production
    const privateKey = {
        crv: "P-256",
        d: "ixN_RbGM7AQUPB4PVdk9a7TS7AdfM2Gabl1oC3OrLq8",
        ext: true,
        key_ops: [ "sign" ],
        kty: "EC",
        x: "xD1jie65r_ecER0zO7nzi5g-FIqRd2-AO3rEenP2JBg",
        y: "iBMI7_wDeyxIYkhaRXgzywKU89_vScvEpmFg9qvikeA"
    }

    const directory = await Directory.from('LetsEncrypt', 'staging')
    const account = await Account.useDirectory(directory).from({ key: privateKey, url: accountUrl })
    const orderUrl = 'https://acme-staging-v02.api.letsencrypt.org/acme/order/113931694/10178470924'
    const order = await Order.useAccount(account).fromUrl(orderUrl)
    // console.log(order.result)
    if (order.status === 'pending') {
        const authzs = await order.fetchAuthorizations()
        console.log(await Promise.all(authzs.map(async authz => {
            const verifyToken = await authz.dnsChallenge?.computeVerifyToken()
            await authz.dnsChallenge?.verify()
            return `[${authz.status}] [${authz.dnsChallenge?.result.status}] ${authz.dnsChallengeName} => ${verifyToken}`
        })))
    } else if(order.status === 'ready') {
        console.log('order.status', order.status)
        const csr = await CertificateSigningRequest.fromOrder(order).create()
        const key = await csr.exportPkcs8PrivateKey()
        console.log(key)
        const finilizedOrder = await csr.submit()
        console.log(finilizedOrder.status)
    } else if(order.status === 'valid') {
        console.log(order.result)
        const res = await order.fetchCertificate()
        console.log(res.headers)
        console.log(res.parsedBody)

    }

    // const order = await Order.useAccount(account).create(['*.miaomiao.party', 'miaomiao.party'])
    // console.log(order.url)
}) 