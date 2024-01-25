import { Test, TestingModule } from '@nestjs/testing';
import { QrCodeGeneratorController } from '../src/app/controllers/qr-code-generator.controller';
import { QrCodeGeneratorService } from '../src/app/services/qr-code-generator.service';

describe('QrCodeGeneratorController', () => {
  let qrCodeGeneratorController: QrCodeGeneratorController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [QrCodeGeneratorController],
      providers: [QrCodeGeneratorService],
    }).compile();

    qrCodeGeneratorController = app.get<QrCodeGeneratorController>(
      QrCodeGeneratorController
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(qrCodeGeneratorController.getHello()).toBe('Hello World!');
    });
  });
});
