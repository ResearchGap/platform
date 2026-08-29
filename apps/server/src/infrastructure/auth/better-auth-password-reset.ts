import { AsyncLocalStorage } from "node:async_hooks";

import type { createAuth } from "@platform/auth";

import type { NativePasswordResetProvider } from "../../modules/password-reset/password-reset.repository.js";
import type { PasswordResetDeliveryMode } from "../../modules/password-reset/password-reset.types.js";

interface IssueOperation {
  deliveryMode: PasswordResetDeliveryMode;
  kind: "ISSUE";
  requestId: string;
}

interface CompleteOperation {
  completedUserId?: string;
  kind: "COMPLETE";
  requestId: string;
}

type PasswordResetOperation = CompleteOperation | IssueOperation;

type IssuedLinkHandler = (input: {
  deliveryMode: PasswordResetDeliveryMode;
  requestId: string;
  url: string;
  user: { email: string };
}) => Promise<void>;

export class PasswordResetOperationContext {
  private readonly storage = new AsyncLocalStorage<PasswordResetOperation>();
  private issuedLinkHandler: IssuedLinkHandler | null = null;

  bindIssuedLinkHandler(handler: IssuedLinkHandler): void {
    this.issuedLinkHandler = handler;
  }

  isTrustedOperation = (): boolean => this.storage.getStore() !== undefined;

  sendResetPassword = async (input: { url: string; user: { email: string } }): Promise<void> => {
    const operation = this.storage.getStore();
    if (operation?.kind !== "ISSUE" || !this.issuedLinkHandler) {
      throw new Error("Password reset issuance was not initiated by the application");
    }
    await this.issuedLinkHandler({
      requestId: operation.requestId,
      deliveryMode: operation.deliveryMode,
      url: input.url,
      user: input.user,
    });
  };

  onPasswordReset = async (input: { user: { id: string } }): Promise<void> => {
    const operation = this.storage.getStore();
    if (operation?.kind !== "COMPLETE") {
      throw new Error("Password reset completion was not initiated by the application");
    }
    operation.completedUserId = input.user.id;
  };

  runIssue<T>(operation: IssueOperation, callback: () => Promise<T>): Promise<T> {
    return this.storage.run(operation, callback);
  }

  runComplete<T>(operation: CompleteOperation, callback: () => Promise<T>): Promise<T> {
    return this.storage.run(operation, callback);
  }
}

type AuthInstance = ReturnType<typeof createAuth>;

export class BetterAuthPasswordResetProvider implements NativePasswordResetProvider {
  constructor(
    private readonly auth: AuthInstance,
    private readonly operationContext: PasswordResetOperationContext,
  ) {}

  async issue(input: Parameters<NativePasswordResetProvider["issue"]>[0]): Promise<void> {
    await this.operationContext.runIssue(
      { kind: "ISSUE", requestId: input.requestId, deliveryMode: input.deliveryMode },
      async () => {
        await this.auth.api.requestPasswordReset({
          body: { email: input.email, redirectTo: input.redirectTo },
        });
      },
    );
  }

  async complete(
    input: Parameters<NativePasswordResetProvider["complete"]>[0],
  ): Promise<{ userId: string }> {
    const operation: CompleteOperation = { kind: "COMPLETE", requestId: input.requestId };
    await this.operationContext.runComplete(operation, async () => {
      await this.auth.api.resetPassword({
        body: { newPassword: input.newPassword, token: input.token },
      });
    });
    if (!operation.completedUserId) {
      throw new Error("Better Auth did not confirm password reset completion");
    }
    return { userId: operation.completedUserId };
  }
}
