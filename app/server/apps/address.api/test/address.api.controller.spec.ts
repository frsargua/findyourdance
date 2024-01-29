import { Test, TestingModule } from '@nestjs/testing';
import { AddressApiController } from '../src/app/controllers/address.api.controller';
import { AddressApiService } from '../src/app/services/address.api.service';

describe('AddressApiController', () => {
  let addressApiController: AddressApiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AddressApiController],
      providers: [AddressApiService],
    }).compile();

    addressApiController = app.get<AddressApiController>(AddressApiController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(addressApiController.getHello()).toBe('Hello World!');
    });
  });
});
