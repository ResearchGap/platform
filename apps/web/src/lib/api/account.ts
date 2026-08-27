import { apiRequest } from "./client";
import type {
  CurrentAccount,
  RegistrationInput,
  RegistrationResult,
  UpdateProfileInput,
  UserProfile,
} from "./mentee-types";

export function getCurrentAccount(init: RequestInit = {}) {
  return apiRequest<CurrentAccount>("/api/me/account", { cache: "no-store", ...init });
}

export function registerAccount(input: RegistrationInput) {
  return apiRequest<RegistrationResult>("/api/registrations", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updateCurrentProfile(input: UpdateProfileInput) {
  return apiRequest<UserProfile>("/api/me/profile", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}
