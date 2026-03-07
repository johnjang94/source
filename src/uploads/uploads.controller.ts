import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presign')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createUploadUrl(@Body() dto: CreateUploadUrlDto) {
    return this.uploadsService.createUploadUrl(dto);
  }
}
