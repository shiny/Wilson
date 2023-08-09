import { test, expect, afterEach, mock } from 'bun:test'
import { AcmeFetch, Fetch, FetchFn } from '..'

afterEach(() => {
//    Fetch.restoreMock()
})

test('Fetch Mock', async () => {
    const responseBody = 'works'
    Fetch.mockTextResponse(responseBody)
    const mockedResponse = await Fetch.fetch('http://example.com')
    const mockedText = await mockedResponse.text()
    expect(mockedText).toBe(responseBody)
    // request to exaple.com would take hundred milliseconds
    // so we don't test it for the moment
})

test('Fetch Instance', async () => {
    expect(Fetch.createInstance())
        .toBeInstanceOf(Fetch)
    expect(AcmeFetch.createInstance())
        .toBeInstanceOf(AcmeFetch)
})

test('Fetch Text', async () => {
    const mockedText = 'ok'
    const fetch = Fetch.createInstance().mockTextResponse(mockedText)
    const responseText = await fetch.fetchText('http://example.com')
    expect(responseText).toBe(mockedText)
})

test('Fetch JSON', async () => {
    const jsonObject = { status: 'ok' }
    const responseJson = await Fetch.mockJsonResponse(jsonObject)
        .fetchJSON('http://example.com')
    expect(responseJson).toEqual(jsonObject)
})

const mockTesting = () => {
    // mock response is paired with ifMatch
    Fetch.mockTextResponse('')
    expect(
        Fetch.createInstance()
        .shouldMock('http://example.com/robots.txt')
    ).toBeTrue()
    expect(
        Fetch.createInstance()
        .shouldMock('http://example.org/robots.txt')
    ).toBeFalse()
    Fetch.restoreMock()
}

test('Fetch mock match: String', () => {
    Fetch.ifMatch('http://example.com')
    mockTesting()
})

test('Fetch mock match: RegEx', () => {
    Fetch.ifMatch(/example\.com/)
    mockTesting()
})

test('Fetch mock match: Callback', () => {
    Fetch.ifMatch((url: string) => url.indexOf('example.com') > -1)
    mockTesting()
})

test('Fetch withOptions', async () => {
    const fetch = AcmeFetch.createInstance().withOptions({
        headers: {
            'accept': 'application/pem-certificate-chain'
        }
    })
    const originalFetch = global.fetch
    const exampleUrl = 'https://example.com'

    // as toHaveBeenCalledWith has not been implemented
    // this is a replacement below
    global.fetch = mock<FetchFn>(async (url, init) => {
        expect(url).toBe(exampleUrl)
        expect(init?.headers)
            .toHaveProperty('content-type', fetch.requestContentType)
        return new Response('')
    })
    await fetch.fetch(exampleUrl, {
        headers: { 'accept-language': 'en_US' }
    })
    await fetch.fetch(exampleUrl, { verbose: true })
    expect(global.fetch).toHaveBeenCalledTimes(2)
    global.fetch = originalFetch
})
