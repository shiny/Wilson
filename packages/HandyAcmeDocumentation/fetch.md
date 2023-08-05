# Fetch

Fetch is a wrapper of native web standard [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) with mock out of box.

## Auto parse response content

`Fetch.fetchJSON` would parse response content as JSON and `Fetch.fetchText` as text. Also you can `Fetch.fetch` to fetch the raw Web [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response).

```typescript
const { origin: ip } = await Fetch.fetchJSON('http://httpbun.com/ip')
console.log('my ip is', ip)

const textIp = await Fetch.fetchText('https://ip.time2.cc/')
const res = await Fetch.fetch('https://ip.time2.cc/')
await res.text()
```

## Match and mock response
Mock is quite usefull for testing. Fetch could mock the response result you want.
Three type of matching conditions are accept:

- string: url starts with this string
- RegExp: match the RegExp exression 
- callback: `(url: string) => boolean` return `true` to match

```typescript
Fetch.mockJsonResponse({ status: 'ok' }).ifMatch('http://example.com')

const mockedText = await Fetch.fetchText('http://example.com')
const originalText = await Fetch.fetchText('http://example.org')
```

## Fetch instance and statically call

The `Fetch.createInstance` method would create a instance 
that has a local scope which won't affect global Fetch settings.

```typescript
interface IpResult {
    origin: string
}
const ipUrl = 'http://httpbun.com/ip'

const fetch = Fetch.createInstance()
fetch.mockJsonResponse({ origin: '0.0.0.0'}).ifMatch(ipUrl)

const { origin: trueIp } = await Fetch.fetchJSON<IpResult>(ipUrl)
const { origin: fakeIp } = await fetch.fetchJSON<IpResult>(ipUrl)
console.log('ip:', trueIp, 'fake ip:', fakeIp)
```

## Request Proxy

Fetch support proxy with `Fetch.withProxy('http://120.0.0.0:8080')`.
This is a [Bun fetch option](https://github.com/oven-sh/bun/issues/1829) still have [bugs](https://github.com/shiny/Wilson/issues/1).
Still needs more work on it.
