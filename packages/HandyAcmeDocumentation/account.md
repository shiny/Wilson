# Account

## Create an account

An account is required for SSL cert application. 
You can create the account in the beginning and reuse it after.

Example #1: create a LetsEncrypt Staging account
```typescript
const directory = await Directory.from('LetsEncrypt', 'staging')
const account = await Account.useDirectory(directory)
    .create({
        contact: ['mailto:someone@example.org'],
        termsOfServiceAgreed: true
    })

// private key in jwk format
const privateJwk = await account.exportPrivateKey()
// public key in jwk format
const publicJwk = await account.exportPublicKey()
```

## Query a existing account by Key
Example #2: You can use the existing key to query corresponding account(url)
```typescript
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
const account = await Account.useDirectory(directory).from({ key: privateKey })
await account.create({
    onlyReturnExisting: true
})
console.log('Account url is ', account.url)
```

## initializing a existed account

Two params are required: private JsonWebKey and account's url

Example #3 Initializing a existed account
```typescript
// privateKey defined in Example #2
const accountUrl = `https://acme-staging-v02.api.letsencrypt.org/acme/acct/113931694`
const directory = await Directory.from('LetsEncrypt', 'staging')
const account = await Account.useDirectory(directory).from({
    key: privateKey,
    url: accountUrl
})
```

That's it

## Google EAB credentials

if external account binding is required like Google/ZeroSSL, you can use `Account.withEabKey(kid, hmacKey)` to specify the EAB credentials.

```typescript
const kid = '__kid_from_google_console__' 
const hmacKey = '__hmac_from_google_console__'

const directory = await Directory.from('Google', 'staging')
const account = await Account.useDirectory(directory).
    withEabKey(kid, hmacKey)
    create({
        contact: ['mailto:someone@example.org'],
        termsOfServiceAgreed: true
    })
```
