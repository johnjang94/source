import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AgreementsService } from './agreements.service';
import { SignAgreementDto } from './agreements.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { AuthUser } from '../auth/auth-user.decorator';

@Controller('agreements')
@UseGuards(SupabaseAuthGuard)
export class AgreementsController {
  constructor(private readonly agreementsService: AgreementsService) {}

  @Post('sign')
  sign(
    @AuthUser() user: { id: string },
    @Body() dto: SignAgreementDto,
  ) {
    return this.agreementsService.sign(user.id, dto);
  }

  @Get('project/:projectId')
  getByProject(@Param('projectId') projectId: string) {
    return this.agreementsService.getByProject(projectId);
  }

  @Get('user')
  getByUser(@AuthUser() user: { id: string }) {
    return this.agreementsService.getByUser(user.id);
  }
}
