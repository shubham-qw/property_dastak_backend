import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { LeadsService } from './Providers/leads.service';
import { 
  MoversPackersLeadDto, 
  InteriorDesignersLeadDto, 
  HomeLoanLeadDto, 
  VastuLeadDto 
} from './dto/leads.dto';

@Controller('leads')
@UsePipes(new ValidationPipe({ transform: true }))
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post('movers-packers')
  @HttpCode(HttpStatus.CREATED)
  async moversPackers(@Body() dto: MoversPackersLeadDto) {
    return this.leadsService.createLead('movers_packers', dto as any);
  }

  @Post('interior-designers')
  @HttpCode(HttpStatus.CREATED)
  async interiorDesigners(@Body() dto: InteriorDesignersLeadDto) {
    return this.leadsService.createLead('interior_designers', dto as any);
  }

  @Post('home-loan')
  @HttpCode(HttpStatus.CREATED)
  async homeLoan(@Body() dto: HomeLoanLeadDto) {
    return this.leadsService.createLead('home_loan', dto as any);
  }

  @Post('vastu')
  @HttpCode(HttpStatus.CREATED)
  async vastu(@Body() dto: VastuLeadDto) {
    return this.leadsService.createLead('vastu', dto as any);
  }
}


