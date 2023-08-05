import { test, expect } from 'bun:test'
import { Account, Directory, JSONStringifyBase64url, capsuleJoseBody } from '..'

test('JSONStringifyBase64url', () => {
    expect(JSONStringifyBase64url({ status: 'ok' })).toBe('eyJzdGF0dXMiOiJvayJ9')
})

test('capsuleJoseBody', () => {
    const joseBody = capsuleJoseBody('protected', 'payload', () => 'signature')
    expect(joseBody).resolves.toEqual({
        protected: "InByb3RlY3RlZCI",
        payload: "InBheWxvYWQi",
        signature: "signature"
    })
})

test('makeRequestBody', async () => {
    const fakeDirectory = Directory.fake()
    const account = Account.useDirectory(fakeDirectory)
    // Todo: load key first, or sinature would change every time
    await account.generateKey()
    account.url = 'http://exmaple.com'

    const joseBody = await account.makeRequestBody({
        url: 'http://example.com',
        nonce: 'example-none'
    }, { isExample: true })
    expect(joseBody).toHaveProperty('protected', 'eyJ1cmwiOiJodHRwOi8vZXhhbXBsZS5jb20iLCJub25jZSI6ImV4YW1wbGUtbm9uZSIsImFsZyI6IkVTMjU2Iiwia2lkIjoiaHR0cDovL2V4bWFwbGUuY29tIn0')
    expect(joseBody).toHaveProperty('payload', 'eyJpc0V4YW1wbGUiOnRydWV9')
    // expect(joseBody).toHaveProperty('signature', 'tIQpcCG5y4S1Hfxg0e_u-IF9yjbdPMaslF-xkv00xrLpCGitYwYXSBQ2G4IL8mZIRQRsdocsq9qEeNOBJ9kivQ')
})
