---
outline: deep
---

# Acme Directory

## Directory.fromUrl
ACME servers provide a directory object to find resources,
this should be the only URL needed to configure client
according to [#rfc8555](https://datatracker.ietf.org/doc/html/rfc8555).

HandyAcme would request this object for latest resources url.
```typescript
const directoryUrl = 'https://acme-v02.api.letsencrypt.or/directory'
const directory = await Directory.fromUrl(directoryUrl)
```

Here is a typical Directory Object from Google:
```typescript
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

## Directory.fromResult
if you don't want a request since resource urls are permanent link,
you can also from a cached result.
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
