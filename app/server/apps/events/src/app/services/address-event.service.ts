import { Injectable } from '@nestjs/common';
import { AddressEventRepository } from '../repository/address-event.repository';
import { EventAddress } from '@app/common';
import { CreateAddressDto } from '../dto/address.dto';

@Injectable()
export class AddressEventService {
  constructor(private readonly addressRepository: AddressEventRepository) {}

  async createAddress(addressDto: CreateAddressDto) {
    const addressFromDb = await this.getAddress(addressDto);

    if (addressFromDb) {
      return addressFromDb;
    }
    const { latitude, longitude, ...rest } = addressDto;
    const newAddress = this.addressRepository.create({
      ...rest,
      latitude,
      longitude,
    });
    const savedAddress = await this.addressRepository.save(newAddress);
    await this.addressRepository.updateLocation(
      savedAddress.id,
      latitude,
      longitude
    );
    const updatedAddress = await this.addressRepository.findOne({
      where: { id: savedAddress.id },
    });

    const newSavedAddress = await this.addressRepository.save(updatedAddress);

    return newSavedAddress;
  }

  async getAddress(addressDto: CreateAddressDto) {
    let address: EventAddress;
    try {
      address = await this.addressRepository.findOne({
        where: {
          uniqueDeliveryPointRef: addressDto.uniqueDeliveryPointRef,
        },
      });
    } catch (err) {
      return;
    }
    return address;
  }
}
