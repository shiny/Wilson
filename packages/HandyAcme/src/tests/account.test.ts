import { test, expect } from 'bun:test'
import { JSONStringifyBase64url, capsuleJoseBody } from '..'

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
