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
    const { uniqueDeliveryPointRef } = addressDto;

    if (!uniqueDeliveryPointRef) {
      this.logger.error('UniqueDeliveryPointRef is missing');
      throw new BadRequestException('UniqueDeliveryPointRef is required');
    }

    this.logger.log('Attempting to create or fetch address', {
      uniqueDeliveryPointRef,
    });

    const existingAddress = await this.getAddress(uniqueDeliveryPointRef);

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
        uniqueDeliveryPointRef,
      });

      throw new InternalServerErrorException('Failed to save new address', {
        cause: error,
      });
    }
  }

  async getAddress(
    uniqueDeliveryPointRef: string
  ): Promise<AddressUser | null> {
    if (!uniqueDeliveryPointRef) {
      this.logger.error('UniqueDeliveryPointRef is missing');
      throw new BadRequestException('UniqueDeliveryPointRef is required');
    }

    this.logger.log('Fetching address from database', {
      uniqueDeliveryPointRef,
    });

    try {
      const address = await this.addressRepository.findOne({
        where: { uniqueDeliveryPointRef },
      });

      if (address) {
        this.logger.log('Successfully retrieved address', {
          addressId: address.id,
        });
      } else {
        this.logger.warn('Address not found', {
          uniqueDeliveryPointRef,
        });
      }

      return address;
    } catch (error) {
      this.logger.error('Failed to retrieve address', {
        error: error.message,
        stack: error.stack,
        uniqueDeliveryPointRef,
      });
      throw new InternalServerErrorException('Failed to retrieve address');
    }
  }
}
