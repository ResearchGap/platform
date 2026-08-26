import { ACCOUNT_STATUSES, ROLES, type RoleCode } from "../../authorization/authorization.types";
import type { IdentityAccessRepository } from "./identity.repository";
import { RegistrationConsistencyError } from "./identity.errors";
import type { IdentityProvider, PublicRegistration, RegistrationResult } from "./identity.types";

function requestedRole(registration: PublicRegistration): RoleCode {
  if (registration.kind === "MENTEE") {
    return ROLES.MENTEE;
  }
  if (registration.kind === "MENTOR") {
    return ROLES.MENTOR;
  }
  return registration.requestedRoleCode;
}

export class RegistrationService {
  constructor(
    private readonly identityProvider: IdentityProvider,
    private readonly accessRepository: IdentityAccessRepository,
  ) {}

  async register(registration: PublicRegistration): Promise<RegistrationResult> {
    const identity = await this.identityProvider.signUp(registration);
    const roleCode = requestedRole(registration);

    try {
      await this.accessRepository.initializeMentee(identity.user.id);

      if (roleCode !== ROLES.MENTEE) {
        await this.accessRepository.initializePendingRegistration(identity.user.id, roleCode);
      }
    } catch (error) {
      try {
        await this.identityProvider.deleteUser(identity.user.id);
      } catch {
        throw new RegistrationConsistencyError(error);
      }
      throw error;
    }

    return {
      ...identity,
      access: {
        accountStatus:
          roleCode === ROLES.MENTEE ? ACCOUNT_STATUSES.ACTIVE : ACCOUNT_STATUSES.PENDING,
        roleCode,
      },
    };
  }
}
