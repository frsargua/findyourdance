import { Body, Controller, Post, Res } from '@nestjs/common';
import { QrCodeGeneratorService } from '../services/qr-code-generator.service';
import { Response } from 'express';

@Controller('generate/code/')
export class QrCodeGeneratorController {
  constructor(
    private readonly qrCodeGeneratorService: QrCodeGeneratorService
  ) {}

  @Post('qrcode')
  async generateQrCode(@Body('uuid') uuid: string, @Res() response: Response) {
    const qrCodeImage = await this.qrCodeGeneratorService.createQRcode(uuid);
    response.setHeader('Content-Type', 'image/svg');
    console.log(qrCodeImage);
    response.send(qrCodeImage);
  }

  @Post('barcode')
  async generateBarcode(@Body('uuid') uuid: string, @Res() response: Response) {
    const barcodeImage = await this.qrCodeGeneratorService.createBarcode(uuid);
    response.setHeader('Content-Type', 'image/svg');
    console.log(barcodeImage);

    response.send(barcodeImage);
  }
}
