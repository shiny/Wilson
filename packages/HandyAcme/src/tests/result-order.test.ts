import { test, expect, beforeEach } from 'bun:test'
import ResultOrder, { isFilledArray, isResultOrder } from '../types/Result/Order'
import { isIdentifier } from '../types/Result/Identifier'

let example: ResultOrder
beforeEach(() => {
    example = {
        status: "pending",
        expires: "2023-08-11T12:23:16Z",
        identifiers: [
          {
            type: "dns",
            value: "*.example.com"
          }, {
            type: "dns",
            value: "example.com"
          }
        ],
        authorizations: [
            "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/7593469114",
            "https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/7593469124"
        ],
        finalize: "https://acme-staging-v02.api.letsencrypt.org/acme/finalize/113548334/10114659764"
    }
})

test('is filled array', () => {
    expect(isFilledArray([])).toBeFalse()
    expect(isFilledArray(new Array)).toBeFalse()
    expect(isFilledArray(0)).toBeFalse()
    expect(isFilledArray(undefined)).toBeFalse()
    expect(isFilledArray(null)).toBeFalse()
    expect(isFilledArray([1])).toBeTrue()
})

test('is valid result order', () => {
    expect(isResultOrder(example)).toBeTrue()
})

test('is malformed result order', () => {
    const malformedExample1 = {
        ...example,
        status: '__malformed_status__'
    }
    expect(isResultOrder(malformedExample1)).toBeFalse()
    const malformedExample2 = {
        ...example,
    }
    // @ts-expect-error for testing
    malformedExample2.identifiers[0].type = '__malformed_type__'
    expect(isResultOrder(malformedExample2)).toBeFalse()
})

test('isIdentifier', () => {
    expect(isIdentifier(example.identifiers[0])).toBeTrue()
    expect(isIdentifier([])).toBeFalse()
    expect(isIdentifier([0])).toBeFalse()
})
