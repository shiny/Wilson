import { test, expect, beforeEach } from 'bun:test'
import { Directory, AcmeFetch, AcmeResponse, Account } from '..'
const fakeDirectory = Directory.fake()
let fetch: AcmeFetch

beforeEach(() => fetch = AcmeFetch.useDirectory(fakeDirectory))

test('AcmeFetch', () => {
    const fetch = new AcmeFetch
    expect(() => fetch.account).toThrow(/account/i)
    expect(() => fetch.directory).toThrow(/directory/i)
})

test('AcmeFetch useDirectory', () => {
    const exampleUrl = 'http://example.com'
    expect(fetch.directory).toEqual(fakeDirectory)
    expect(fetch.transformResourceTypeToUrl('keyChange')).toBe(fakeDirectory.result.keyChange)
    expect(fetch.transformResourceTypeToUrl(exampleUrl)).toBe(exampleUrl)
})

test('isResourceType', () => {
    expect(fetch.isResourceType('newOrder')).toBe(true)
    expect(fetch.isResourceType('new')).toBe(false)
})


test('Nonce', () => {
    const responseWithNonce = AcmeResponse.from(new Response(new URLSearchParams({
        status: 'any'
    }), {
        headers: {
            'Replay-Nonce': 'nonce-value-from-cache'
        }
    }))
    fetch.mockResponse(new Response(JSON.stringify({}), {
        headers: {
            'Replay-Nonce': 'nonce-value-from-mock'
        }
    })).ifMatch(fakeDirectory.newNonce)
    fetch.cacheNonceFromResponse(responseWithNonce)
    expect(fetch.nonce()).resolves.toBe('nonce-value-from-cache')
    expect(fetch.nonce()).resolves.toBe('nonce-value-from-mock')
    expect(fetch.nonce()).resolves.toBe('nonce-value-from-mock')
})

function mockNonce(fetch: AcmeFetch) {
    fetch.cacheNonceFromResponse(AcmeResponse.from(new Response('', {
        headers: {
            'replay-nonce': 'value'
        }
    })))
}

test('postSignaturedUsingKey', async () => {
    const body = {
        data: 'test'
    }
    fetch.mockJsonResponse(body).ifMatch(fakeDirectory.newAccount)
    mockNonce(fetch)
    const account = Account.useDirectory(fakeDirectory)
    await account.generateKey()
    fetch.useAccount(account)
    
    expect(fetch.postSignaturedUsingKey('newAccount', {
        contact: ['test'],
        termsOfServiceAgreed: true
    })).resolves.toHaveProperty('body', body)
})


test('postSignatured', async () => {
    const body = {
        data: 'test'
    }
    fetch.mockJsonResponse(body).ifMatch(fakeDirectory.newOrder)
    mockNonce(fetch)
    const account = Account.useDirectory(fakeDirectory)
    await account.generateKey()
    account.url = 'http://exmaple.com'
    fetch.useAccount(account)
    expect(fetch.postSignatured('newOrder', {}))
        .resolves
        .toHaveProperty('body', body)
})
