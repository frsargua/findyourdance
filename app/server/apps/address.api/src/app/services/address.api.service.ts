import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Address } from '../types/apitier.types';

@Injectable()
export class AddressApiService {
  private apiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private httpService: HttpService
  ) {
    this.apiKey = this.configService.get<string>('GET_ADDRESS_API')!;
  }

  async retrieveAddressByPostcode(postcode: string) {
    const url = this.generateUrl(this.apiKey, postcode, 'postcodes');

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data.result.addresses;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  async retrieveSingleAddress(uuid: string) {
    const url = this.generateUrl(this.apiKey, uuid, 'udprn');

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      return this.handleAddressResponse(response.data.result);
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  handleAddressResponse(response: Address) {
    return {
      buildingNumber: response.building_number,
      line_1: response.line_1,
      line_2: response.line_2,
      street: response.thoroughfare,
      town: response.post_town,
      county: response.county,
      uniqueDeliveryPointRef: response.udprn,
      fullAddress: response.address,
      postCode: response.postcode_compact,
      latitude: response.geocode.lattitude,
      longitude: response.geocode.longitude,
    };
  }

  private generateUrl(
    apiKey: string,
    query: string,
    option: 'udprn' | 'postcodes'
  ) {
    return `https://postcode.apitier.com/v1/${option}/${query}?x-api-key=${apiKey}`;
  }
}
