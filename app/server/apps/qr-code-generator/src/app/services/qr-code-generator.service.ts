import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import * as bwipjs from 'bwip-js';
import { Logger } from 'nestjs-pino';

@Injectable()
export class QrCodeGeneratorService {
  constructor(private readonly logger: Logger) {
    this.logger.log('QrCodeGeneratorService initialized');
  }

  async createQRcode(code: string): Promise<string> {
    this.logger.log('createQRcode: Generating QR code', {
      codeLength: code.length,
    });
    try {
      const svgString = await QRCode.toString(code, { type: 'terminal' });
      this.logger.log('createQRcode: QR code generated successfully', {
        svgLength: svgString.length,
      });
      return svgString;
    } catch (err) {
      this.logger.error('createQRcode: Error generating QR code', {
        error: err.message,
        stack: err.stack,
      });
      throw new InternalServerErrorException(
        `Error creating QR code for ${code}`
      );
    }
  }

  async createBarcode(code: string): Promise<string> {
    this.logger.log('createBarcode: Generating barcode', {
      codeLength: code.length,
    });
    try {
      const svgString = bwipjs.toSVG({
        bcid: 'code128', // Barcode type
        text: code, // Text to encode
        scale: 1, // 3x scaling factor
        height: 10, // Bar height, in millimeters
      });
      this.logger.log('createBarcode: Barcode generated successfully', {
        svgLength: svgString.length,
      });
      return svgString;
    } catch (err) {
      this.logger.error('createBarcode: Error generating barcode', {
        error: err.message,
        stack: err.stack,
      });
      throw new InternalServerErrorException(
        `Error creating barcode for ${code}`
      );
    }
  }
}
