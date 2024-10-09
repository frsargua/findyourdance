import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AddressUsersRepository } from '../repository/address-user.repository';
import { GenericAddressDto } from '../dto/create-address.dto';
import { Logger } from 'nestjs-pino';

@Injectable()
export class AddressUserService {
  constructor(
    private readonly addressRepository: AddressUsersRepository,
    protected logger: Logger
  ) {}

  async createAddress(addressDto: GenericAddressDto) {
    this.logger.log('createAddress: Attempting to create or fetch address', {
      addressDto,
    });

    const addressFromDb = await this.getAddress(addressDto);

    if (addressFromDb) {
      this.logger.log(
        'createAddress: Address already exists, returning from database',
        {
          ...addressFromDb,
        }
      );
      return addressFromDb;
    }

    const savedAddress = await this.addressRepository.save(addressDto);

    this.logger.log('createAddress: Successfully saved new address', {
      savedAddress,
    });
    return savedAddress;
  }

  async getAddress(addressDto: GenericAddressDto) {
    const { uniqueDeliveryPointRef } = addressDto;
    try {
      this.logger.log('getAddress: Fetching address from database', {
        uniqueDeliveryPointRef,
      });

      const address = await this.addressRepository.findOne({
        where: {
          uniqueDeliveryPointRef: uniqueDeliveryPointRef,
        },
      });

      if (!address) {
        this.logger.warn(
          `getAddress: Address not found for uniqueDeliveryPointRef: ${uniqueDeliveryPointRef}`
        );
      }

      this.logger.log('getAddress: Successfully retrieved address', {
        address,
      });

      return address;
    } catch (error) {
      this.logger.error('getAddress: Failed to retrieve address', {
        error: error.message,
        stack: error.stack,
        uniqueDeleveryPointRef: uniqueDeliveryPointRef,
      });
      throw new InternalServerErrorException('Failed to retrieve address');
    }
  }
}
