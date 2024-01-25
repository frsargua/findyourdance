import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import * as bwipjs from 'bwip-js';

@Injectable()
export class QrCodeGeneratorService {
  async createQRcode(code: string): Promise<string> {
    try {
      const svgString = await QRCode.toString(code, { type: 'terminal' });
      return svgString;
    } catch (err) {
      console.error('Error generating QR code', err);
      throw err;
    }
  }

  async createBarcode(code: string): Promise<string> {
    try {
      const svgString = bwipjs.toSVG({
        bcid: 'code128', // Barcode type
        text: code, // Text to encode
        scale: 1, // 3x scaling factor
        height: 10, // Bar height, in millimeters
      });

      return svgString;
    } catch (err) {
      console.error('Error generating barcode', err);
      throw err;
    }
  }
}
