import { test, expect } from 'bun:test'
import Fetch from '../Fetch'
import Directory from '../Directory'

const directoryResult = {
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

function testDirectory(directory: Directory) {
    expect(directory).toBeInstanceOf(Directory)
    expect(directory.newAccount).toBe(directoryResult.newAccount)
    expect(directory.meta).toEqual(directoryResult.meta)
    expect(directory.newNonce).toBe(directoryResult.newNonce)
    expect(directory.isExternalAccountRequired).toBe(directoryResult.meta.externalAccountRequired)
}

test('Directory.fromResult', () => {
    const directory = Directory.fromResult(directoryResult)
    testDirectory(directory)
})

test('Directory.fromUrl', async () => {
    // mock from the cached result
    Fetch.ifMatch(/zerossl/).mockJsonResponse(directoryResult)
    const directory = await Directory.fromUrl('https://acme.zerossl.com/v2/DV90/directory')
    testDirectory(directory)
})
