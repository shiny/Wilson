import { test, afterEach, expect, beforeEach } from "bun:test"
import Fetch from "../Fetch"
import Directory from "../Directory"
import { zerosslDirectory } from "../Datasets/Result/Directory"

beforeEach(() => {
  Fetch.mockJsonResponse(zerosslDirectory).ifMatch("https://acme.zerossl.com")
})
afterEach(() => Fetch.restoreMock())

test("Init ZeroSSL Directory from Url", async () => {
    const dir = await Directory.fromUrl(
        "https://acme.zerossl.com/v2/DV90/directory"
    )
    expect(dir.result).toEqual(zerosslDirectory)
})

test("Init ZeroSSL Directory from Provider Name", async () => {
  const dir = await Directory.from('ZeroSSL', 'production')
  expect(dir.result).toEqual(zerosslDirectory)
})
