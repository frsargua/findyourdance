import { Test, TestingModule } from '@nestjs/testing';
import { QrCodeGeneratorService } from '../src/app/services/qr-code-generator.service';
import { QrCodeGeneratorController } from '../src/app/controllers/qr-code-generator.controller';

describe('QrCodeGeneratorController', () => {
  let controller: QrCodeGeneratorController;
  let qrCodeGeneratorService: QrCodeGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QrCodeGeneratorController],
      providers: [
        {
          provide: QrCodeGeneratorService,
          useValue: {
            createQRcode: jest.fn(),
            createBarcode: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<QrCodeGeneratorController>(
      QrCodeGeneratorController
    );
    qrCodeGeneratorService = module.get<QrCodeGeneratorService>(
      QrCodeGeneratorService
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateQrCode', () => {
    it('should generate a QR code', async () => {
      const mockQrCode = 'mock-svg-content';
      const mockUuid = { uuid: '376259f5-dd62-4a57-a441-d660ccdcb273' };
      const mockResponse = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      jest
        .spyOn(qrCodeGeneratorService, 'createQRcode')
        .mockResolvedValue(mockQrCode);

      await controller.generateQrCode(mockUuid, mockResponse as any);

      expect(qrCodeGeneratorService.createQRcode).toHaveBeenCalledWith(
        mockUuid.uuid
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'image/svg'
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockQrCode);
    });
  });

  describe('generateBarcode', () => {
    it('should generate a barcode', async () => {
      const mockBarcode = 'mock-svg-barcode';
      const mockUuid = { uuid: '376259f5-dd62-4a57-a441-d660ccdcb273' };
      const mockResponse = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      jest
        .spyOn(qrCodeGeneratorService, 'createBarcode')
        .mockResolvedValue(mockBarcode);

      await controller.generateBarcode(mockUuid, mockResponse as any);

      expect(qrCodeGeneratorService.createBarcode).toHaveBeenCalledWith(
        mockUuid.uuid
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'image/svg'
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockBarcode);
    });
  });
});
