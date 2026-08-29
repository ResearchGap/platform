export interface ResetLinkCipher {
  decrypt(ciphertext: string): string;
  encrypt(plaintext: string): string;
}
