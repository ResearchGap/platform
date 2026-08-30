import { describe, expect, test } from "bun:test";

import { evaluatePasswordPolicy, satisfiesPasswordPolicy } from "../src/password-policy.js";

describe("password policy", () => {
  test.each([
    ["Short1!", "minLength"],
    [`Aa1!${"x".repeat(125)}`, "maxLength"],
    ["lowercase1!", "uppercase"],
    ["UPPERCASE1!", "lowercase"],
    ["NoNumber!", "number"],
    ["NoSymbol1", "symbol"],
  ] as const)("identifies an invalid password requirement for %s", (password, requirement) => {
    const checks = evaluatePasswordPolicy(password);
    expect(checks[requirement]).toBe(false);
    expect(satisfiesPasswordPolicy(password)).toBe(false);
  });

  test("accepts a password that satisfies every shared requirement", () => {
    const checks = evaluatePasswordPolicy("ValidExample1!");
    expect(checks).toEqual({
      minLength: true,
      maxLength: true,
      uppercase: true,
      lowercase: true,
      number: true,
      symbol: true,
    });
    expect(satisfiesPasswordPolicy("ValidExample1!")).toBe(true);
  });
});
