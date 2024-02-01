import { Test, TestingModule } from '@nestjs/testing';
import { AddressController } from '../src/app/controllers/address.controller';
import { AddressService } from '../src/app/services/address.service';

describe('AddressController', () => {
  let addressController: AddressController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AddressController],
      providers: [AddressService],
    }).compile();

    addressController = app.get<AddressController>(AddressController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(addressController.getHello()).toBe('Hello World!');
    });
  });
});
