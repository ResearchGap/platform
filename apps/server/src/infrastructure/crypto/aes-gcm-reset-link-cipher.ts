import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

import type { ResetLinkCipher } from "../../modules/password-reset/reset-link-cipher.js";

const VERSION = "v1";
const AAD = Buffer.from("researchgap:password-reset-link:v1", "utf8");

export class AesGcmResetLinkCipher implements ResetLinkCipher {
  private readonly key: Buffer;

  constructor(encodedKey: string) {
    this.key = decodeKey(encodedKey);
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    cipher.setAAD(AAD);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [
      VERSION,
      iv.toString("base64url"),
      tag.toString("base64url"),
      encrypted.toString("base64url"),
    ].join(".");
  }

  decrypt(serialized: string): string {
    const [version, ivPart, tagPart, ciphertextPart, extra] = serialized.split(".");
    if (version !== VERSION || !ivPart || !tagPart || !ciphertextPart || extra) {
      throw new Error("Unsupported password reset ciphertext");
    }
    const decipher = createDecipheriv("aes-256-gcm", this.key, Buffer.from(ivPart, "base64url"));
    decipher.setAAD(AAD);
    decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextPart, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  }
}

function decodeKey(encodedKey: string): Buffer {
  const key = /^[0-9a-fA-F]{64}$/.test(encodedKey)
    ? Buffer.from(encodedKey, "hex")
    : Buffer.from(encodedKey, "base64");
  if (key.byteLength !== 32) {
    throw new Error("Password reset encryption key must be exactly 32 bytes");
  }
  return key;
}
