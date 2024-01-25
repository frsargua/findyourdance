import { Body, Controller, Post, Res } from '@nestjs/common';
import { QrCodeGeneratorService } from '../services/qr-code-generator.service';
import { Response } from 'express';
import { CreateQrcode } from '../dto/create-qrcode.dto';

@Controller('generate/code/')
export class QrCodeGeneratorController {
  constructor(
    private readonly qrCodeGeneratorService: QrCodeGeneratorService
  ) {}

  @Post('qrcode')
  async generateQrCode(@Body() code: CreateQrcode, @Res() response: Response) {
    const qrCodeImage = await this.qrCodeGeneratorService.createQRcode(
      code.uuid
    );
    response.setHeader('Content-Type', 'image/svg');
    response.send(qrCodeImage);
  }

  @Post('barcode')
  async generateBarcode(@Body() uuid: CreateQrcode, @Res() response: Response) {
    const barcodeImage = await this.qrCodeGeneratorService.createBarcode(
      uuid.uuid
    );
    response.setHeader('Content-Type', 'image/svg');
    response.send(barcodeImage);
  }
}
