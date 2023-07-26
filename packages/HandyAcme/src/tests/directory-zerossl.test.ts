import { test, mock, afterEach } from 'bun:test'
import Fetch from '../Fetch'
import Directory from '../Directory'
const zerosslDirectory = {
    "newNonce": "https://acme.zerossl.com/v2/DV90/newNonce",
    "newAccount": "https://acme.zerossl.com/v2/DV90/newAccount",
    "newOrder": "https://acme.zerossl.com/v2/DV90/newOrder",
    "revokeCert": "https://acme.zerossl.com/v2/DV90/revokeCert",
    "keyChange": "https://acme.zerossl.com/v2/DV90/keyChange",
    "meta": {
      "termsOfService": "https://secure.trust-provider.com/repository/docs/Legacy/20230516_Certificate_Subscriber_Agreement_v_2_6_click.pdf",
      "website": "https://zerossl.com",
      "caaIdentities": ["sectigo.com", "trust-provider.com", "usertrust.com", "comodoca.com", "comodo.com"],
      "externalAccountRequired": true
    }
}

// Fetch.withProxy('http://127.0.0.1:7890')
afterEach(() => Fetch.restoreMock())
test('ZeroSSL Directory', async () => {
  Fetch.mockJsonResponse({ ok: '123' }).ifMatch(/buypass/)
  const dir = await Directory.fromServer('https://api.test4.buypass.no/acme/directory')
  console.log(dir.result)
})
test('ZeroSSL Directory', async () => {
  const dir = await Directory.fromServer('https://dv.acme-v02.test-api.pki.goog/directory')
  console.log(dir.result)
})