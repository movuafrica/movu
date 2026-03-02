import { Injectable } from '@nestjs/common';
import { AccountKind } from '@workspace/schemas';
import { AccountsService } from '../../accounts/accounts.service';

@Injectable()
export class AccountsSeed {
  constructor(private readonly accounts: AccountsService) { }

  private CLERK_TEST_USER_IDS = [
    'user_2d9e5b1c-8a7c-4f0e-9b3a-1c2d3e4f5g6h',
    'user_3f6a7b8c-9d0e-4f1a-8b2c-3d4e5f6g7h8i',
    'user_4g7h8i9j-0a1b-4f2c-9d3e-4f5g6h7i8j9k',
  ];

  async run() {
    return Promise.all(
      this.CLERK_TEST_USER_IDS.map((clerkUserId) =>
        this.accounts.create({
          userId: clerkUserId,
          kind: AccountKind.enum.BUSINESS,
        }),
      ),
    );
  }
}
