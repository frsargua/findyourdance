import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AddressUserRepository } from '../repository/address-user.repository';
import { GenericAddressDto } from '../dto/create-address.dto';
import { Logger } from 'nestjs-pino';
import { AddressUser } from '@app/common';

@Injectable()
export class AddressUserService {
  constructor(
    private readonly addressRepository: AddressUserRepository,
    protected logger: Logger
  ) {}

  async createAddress(addressDto: GenericAddressDto): Promise<AddressUser> {
    const { uniqueDeliveryPointRef } = addressDto;

    this.logger.log('Attempting to create or fetch address', {
      uniqueDeliveryPointRef,
    });

    let address = await this.getAddress(addressDto);

    if (address) {
      this.logger.log('Address already exists, returning from database', {
        addressId: address.id,
      });
      return address;
    }

    try {
      address = await this.addressRepository.save(addressDto);
      this.logger.log('Successfully saved new address', {
        addressId: address.id,
      });
      return address;
    } catch (error) {
      this.logger.error('Failed to save new address', {
        error: error.message,
        stack: error.stack,
        uniqueDeliveryPointRef,
      });
      throw new InternalServerErrorException('Failed to save new address');
    }
  }

  async getAddress(addressDto: GenericAddressDto): Promise<AddressUser | null> {
    const { uniqueDeliveryPointRef } = addressDto;

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
