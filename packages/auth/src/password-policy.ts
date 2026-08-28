export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const PASSWORD_REQUIREMENTS =
  "Use 8–128 characters with uppercase, lowercase, a number, and a symbol.";

export const PASSWORD_POLICY_ERROR =
  "Password must be 8–128 characters and contain uppercase and lowercase letters, a number, and a symbol.";

const uppercasePattern = /[A-Z]/;
const lowercasePattern = /[a-z]/;
const numberPattern = /[0-9]/;
const symbolPattern = /[^A-Za-z0-9\s]/;

export function satisfiesPasswordPolicy(password: string): boolean {
  return (
    password.length >= PASSWORD_MIN_LENGTH &&
    password.length <= PASSWORD_MAX_LENGTH &&
    uppercasePattern.test(password) &&
    lowercasePattern.test(password) &&
    numberPattern.test(password) &&
    symbolPattern.test(password)
  );
}
