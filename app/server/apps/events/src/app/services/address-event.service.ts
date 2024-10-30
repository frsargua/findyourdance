import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EventAddressRepository } from '../repository/event-address.repository';
import { CreateAddressDto } from '../dto/address.dto';
import { Logger } from 'nestjs-pino';

@Injectable()
export class AddressEventService {
  constructor(
    private readonly eventAddressRepository: EventAddressRepository,
    protected logger: Logger
  ) {
    this.logger.log('AddressEventService initialized');
  }

  async createAddress(addressDto: CreateAddressDto) {
    this.logger.log('createAddress: Attempting to create or fetch address', {
      addressDto,
    });
    const addressFromDb = await this.getAddress(addressDto);

    if (addressFromDb) {
      this.logger.log(
        'createAddress: Address already exists, returning from database',
        { addressFromDb }
      );

      return addressFromDb;
    }

    this.logger.log('createAddress: Address not found, creating new address');

    const { latitude, longitude, ...rest } = addressDto;
    const newAddress = this.eventAddressRepository.create({
      ...rest,
      latitude,
      longitude,
    });

    this.logger.log('createAddress: Saving new address', { newAddress });

    const savedAddress = await this.eventAddressRepository.save(newAddress);

    if (!savedAddress) {
      this.logger.error('createAddress: Updated address not found', {
        addressId: newAddress.id,
      });
      throw new NotFoundException('temporary fix for not found address.');
    }

    this.logger.log('createAddress: Successfully created new address', {
      newAddress,
    });
    return newAddress;
  }

  async getAddress(addressDto: CreateAddressDto) {
    const { uniqueDeliveryPointReference } = addressDto;

    this.logger.log('getAddress: Attempting to fetch address', {
      uniqueDeliveryPointReference,
    });

    try {
      const address = await this.eventAddressRepository.findOne({
        where: {
          uniqueDeliveryPointReference: uniqueDeliveryPointReference,
        },
      });

      if (!address) {
        this.logger.warn('getAddress: Address not found', {
          uniqueDeliveryPointReference,
        });
      } else {
        this.logger.log('getAddress: Address found', { address });
      }

      return address;
    } catch (error) {
      this.logger.error('getAddress: Error retrieving address', {
        error: error.message,
        stack: error.stack,
        uniqueDeliveryPointReference,
      });
      throw new InternalServerErrorException('Failed to retrieve address');
    }
  }
}
