---
outline: deep
---

# Directory

## Fetch to find resources
ACME server provide a directory object to find resources,
thus should be the only URL needed to configure client.
See [#rfc8555](https://datatracker.ietf.org/doc/html/rfc8555) for more information.

e.g., you can use `await Directory.from('LetsEncrypt', 'staging')` 
starting use Let's Encrypt staging server. 

You can also call `Directory.fromUrl` for a custom URL.
```typescript
const directoryUrl = 'https://dv.acme-v02.test-api.pki.goog/directory'
const directory = await Directory.fromUrl(directoryUrl)
```

Here is a typical Directory Object from Google:
```typescript
const directory = await Directory.from('Google', 'staging')
console.log(directory.result)
// print result
{
  newNonce: "https://dv.acme-v02.api.pki.goog/new-nonce",
  newAccount: "https://dv.acme-v02.api.pki.goog/new-account",
  newOrder: "https://dv.acme-v02.api.pki.goog/new-order",
  newAuthz: "https://dv.acme-v02.api.pki.goog/new-authz",
  revokeCert: "https://dv.acme-v02.api.pki.goog/revoke-cert",
  keyChange: "https://dv.acme-v02.api.pki.goog/key-change",
  renewalInfo: "https://dv.acme-v02.api.pki.goog/renewal-info",
  meta: {
    termsOfService: "https://pki.goog/GTS-SA.pdf",
    website: "https://pki.goog",
    caaIdentities: ["pki.goog"],
    externalAccountRequired: true
  }
}
```

## Using a cached result
if you don't want a request since resource link won't change for a period,
you can also initialize directory from a cached result.
```typescript
const googleDirectory = {
  newNonce: "https://dv.acme-v02.api.pki.goog/new-nonce",
  ...
}
const directory = Directory.fromResult(googleDirectory)
```
## Appendix

### Popular Acme providers

| Name | Env | Directory URL |
|---|---|---|
| Let's Encrypt| Production | https://acme-v02.api.letsencrypt.or/directory |
| Let's Encrypt| Staging | https://acme-staging-v02.api.letsencrypt.org/directory |
| ZeroSSL | Production | https://acme.zerossl.com/v2/DV90/directory |
| BuyPass | Production | https://api.buypass.com/acme/directory |
| BuyPass | Staging | https://api.test4.buypass.no/acme/directory |
| Google Trust | Production | https://dv.acme-v02.api.pki.goog/directory |
| Google Trust | Staging | https://dv.acme-v02.test-api.pki.goog/directory |
