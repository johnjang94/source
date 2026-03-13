import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateEarlyAccessDto } from './dto/create-early-access.dto';
import { EarlyAccessService } from './early-access.service';

@Controller('early-access')
export class EarlyAccessController {
  constructor(private readonly earlyAccessService: EarlyAccessService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateEarlyAccessDto) {
    await this.earlyAccessService.create(dto);
    return { message: 'Early access application received.' };
  }
}
