export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const PASSWORD_REQUIREMENTS =
  "Use 8–128 characters with uppercase, lowercase, a number, and a symbol.";

export const PASSWORD_POLICY_ERROR =
  "Password must be 8–128 characters and contain uppercase and lowercase letters, a number, and a symbol.";

export interface PasswordPolicyChecks {
  lowercase: boolean;
  maxLength: boolean;
  minLength: boolean;
  number: boolean;
  symbol: boolean;
  uppercase: boolean;
}

const uppercasePattern = /[A-Z]/;
const lowercasePattern = /[a-z]/;
const numberPattern = /[0-9]/;
const symbolPattern = /[^A-Za-z0-9\s]/;

export function satisfiesPasswordPolicy(password: string): boolean {
  return Object.values(evaluatePasswordPolicy(password)).every(Boolean);
}

export function evaluatePasswordPolicy(password: string): PasswordPolicyChecks {
  return {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    maxLength: password.length <= PASSWORD_MAX_LENGTH,
    uppercase: uppercasePattern.test(password),
    lowercase: lowercasePattern.test(password),
    number: numberPattern.test(password),
    symbol: symbolPattern.test(password),
  };
}
