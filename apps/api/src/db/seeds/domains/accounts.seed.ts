import { Injectable } from '@nestjs/common';
import { AccountKind } from '@workspace/schemas';
import { AccountsService } from '../../../accounts/accounts.service';

@Injectable()
export class AccountsSeed {
  constructor(private readonly accounts: AccountsService) { }

  private CLERK_TEST_USER_IDS = [
    'user_3ARxiqEfSGZdDCYuW5fk2kahE2B',
    'user_3ARxoRPulQBPji056uYRIpNlbbm',
    'user_3ARxzWVri43TOAl0qONQtZyHfV2',
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
