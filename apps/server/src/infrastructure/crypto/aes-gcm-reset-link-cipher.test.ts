import { randomBytes } from "node:crypto";

import { expect, test } from "bun:test";

import { AesGcmResetLinkCipher } from "./aes-gcm-reset-link-cipher.js";

test("AES-GCM password reset links are recoverable without storing plaintext", () => {
  const cipher = new AesGcmResetLinkCipher(randomBytes(32).toString("base64"));
  const plaintext = "https://app.example.test/api/auth/reset-password/sensitive-token";
  const encrypted = cipher.encrypt(plaintext);

  expect(encrypted).toStartWith("v1.");
  expect(encrypted).not.toContain("sensitive-token");
  expect(cipher.decrypt(encrypted)).toBe(plaintext);
});
