import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './Providers/leads.service';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService]
})
export class LeadsModule {}


