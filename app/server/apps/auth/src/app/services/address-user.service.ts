import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AddressUserRepository } from '../repository/address-user.repository';
import { GenericAddressDto } from '../dto/create-address.dto';
import { Logger } from 'nestjs-pino';
import { AddressUser } from '@app/common';

@Injectable()
export class AddressUserService {
  constructor(
    private readonly addressRepository: AddressUserRepository,
    private logger: Logger
  ) {}

  async createAddress(addressDto: GenericAddressDto): Promise<AddressUser> {
    const { uniqueDeliveryPointReference } = addressDto;

    if (!uniqueDeliveryPointReference) {
      this.logger.error('UniqueDeliveryPointRef is missing');
      throw new BadRequestException('UniqueDeliveryPointRef is required');
    }

    this.logger.log('Attempting to create or fetch address', {
      uniqueDeliveryPointReference,
    });

    const existingAddress = await this.getAddress(uniqueDeliveryPointReference);

    if (existingAddress) {
      this.logger.log('Address already exists, returning from database', {
        addressId: existingAddress.id,
      });
      return existingAddress;
    }

    try {
      const newAddress = await this.addressRepository.save(addressDto);
      this.logger.log('Successfully saved new address', {
        addressId: newAddress.id,
      });
      return newAddress;
    } catch (error) {
      this.logger.error('Failed to save new address', {
        error: error.message,
        stack: error.stack,
        uniqueDeliveryPointReference,
      });

      throw new InternalServerErrorException('Failed to save new address', {
        cause: error,
      });
    }
  }

  async getAddress(
    uniqueDeliveryPointReference: string
  ): Promise<AddressUser | null> {
    if (!uniqueDeliveryPointReference) {
      this.logger.error('UniqueDeliveryPointRef is missing');
      throw new BadRequestException('UniqueDeliveryPointRef is required');
    }

    this.logger.log('Fetching address from database', {
      uniqueDeliveryPointReference,
    });

    try {
      const address = await this.addressRepository.findOne({
        where: { uniqueDeliveryPointReference },
      });

      if (address) {
        this.logger.log('Successfully retrieved address', {
          addressId: address.id,
        });
      } else {
        this.logger.warn('Address not found', {
          uniqueDeliveryPointReference,
        });
      }

      return address;
    } catch (error) {
      this.logger.error('Failed to retrieve address', {
        error: error.message,
        stack: error.stack,
        uniqueDeliveryPointReference,
      });
      throw new InternalServerErrorException('Failed to retrieve address');
    }
  }
}
