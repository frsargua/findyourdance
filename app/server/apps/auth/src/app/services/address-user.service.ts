import { Injectable } from '@nestjs/common';
import { AddressUsersRepository } from '../repository/address-user.repository';
import { GenericAddressDto } from '../dto/create-address.dto';
import { AddressUser } from '@app/common';

@Injectable()
export class AddressUserService {
  constructor(private readonly addressRepository: AddressUsersRepository) {}

  async createAddress(addressDto: GenericAddressDto) {
    const addressFromDb = await this.getAddress(addressDto);

    if (addressFromDb) {
      console.log('repeated');
      return addressFromDb;
    }

    return this.addressRepository.save(addressDto);
  }

  async getAddress(addressDto: GenericAddressDto) {
    let address: AddressUser;
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
