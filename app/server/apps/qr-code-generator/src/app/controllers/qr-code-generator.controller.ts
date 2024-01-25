import { Body, Controller, Post, Res } from '@nestjs/common';
import { QrCodeGeneratorService } from '../services/qr-code-generator.service';
import { Response } from 'express';

@Controller('generate/code/qr')
export class QrCodeGeneratorController {
  constructor(
    private readonly qrCodeGeneratorService: QrCodeGeneratorService
  ) {}

  @Post()
  async generateQrCode(@Body('uuid') uuid: string, @Res() response: Response) {
    const qrCodeImage = await this.qrCodeGeneratorService.createQRcode(uuid);
    response.setHeader('Content-Type', 'image/png');
    response.send(qrCodeImage);
  }
}
