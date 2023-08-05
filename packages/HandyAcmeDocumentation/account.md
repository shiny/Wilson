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
