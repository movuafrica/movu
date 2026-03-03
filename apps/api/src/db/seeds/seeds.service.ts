import { Injectable, Logger } from '@nestjs/common';
import { AccountsSeed } from './domains/accounts.seed';

@Injectable()
export class SeedsService {
  private readonly logger = new Logger(SeedsService.name);

  constructor(private readonly accountSeed: AccountsSeed) {}

  async run() {
    this.logger.log('🌱 Running seeds...');
    await this.accountSeed.run();
    this.logger.log('✅ Seeds completed.');
  }
}
