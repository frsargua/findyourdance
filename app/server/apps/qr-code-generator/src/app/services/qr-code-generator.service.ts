import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeGeneratorService {
  async createQRcode(code: string) {
    try {
      const svgString = await QRCode.toString(code, { type: 'terminal' });
      return svgString;
    } catch (err) {
      console.error('Error generating QR code', err);
      throw err;
    }
  }
}
