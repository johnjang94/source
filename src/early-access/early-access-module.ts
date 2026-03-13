import { Module } from '@nestjs/common';

import { EarlyAccessService } from './early-access.service';
import { EarlyAccessController } from './early-access-controller';

@Module({
  controllers: [EarlyAccessController],
  providers: [EarlyAccessService],
})
export class EarlyAccessModule {}
