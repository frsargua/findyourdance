import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Address } from '../types/apitier.types';
import { Logger } from 'nestjs-pino';

@Injectable()
export class AddressApiService {
  private apiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private httpService: HttpService,
    private logger: Logger
  ) {
    this.apiKey = this.configService.get<string>('GET_ADDRESS_API')!;
    this.logger.log('AddressApiService: Service initialized');
  }

  async retrieveAddressByPostcode(postcode: string) {
    const url = this.generateUrl(this.apiKey, postcode, 'postcodes');
    this.logger.log(
      'retrieveAddressByPostcode: Attempting to retrieve addresses',
      { postcode, url }
    );

    try {
      const response = await firstValueFrom(this.httpService.get(url));

      const addresses = response.data.result.addresses.map(
        (address: Address) => {
          return this.handleAddressResponse(address);
        }
      );
      this.logger.log(
        'retrieveAddressByPostcode: Successfully retrieved addresses',
        { postcode, count: addresses.length }
      );

      return addresses;
    } catch (error) {
      this.logger.error(
        'retrieveAddressByPostcode: Failed to fetch addresses',
        {
          postcode,
          apiUrl: url,
          error: error.message,
          stack: error.stack,
        }
      );

      throw new HttpException(
        'Failed to fetch addresses',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async retrieveSingleAddress(uuid: string) {
    const url = this.generateUrl(this.apiKey, uuid, 'udprn');
    this.logger.log('retrieveSingleAddress: Attempting to retrieve address', {
      uuid,
      url,
    });

    try {
      const response = await firstValueFrom(this.httpService.get(url));

      const address = this.handleAddressResponse(response.data.result);

      this.logger.log('retrieveSingleAddress: Successfully retrieved address', {
        uuid,
      });

      return address;
    } catch (error) {
      this.logger.error('retrieveSingleAddress: Failed to fetch address', {
        uuid,
        error: error.message,
        stack: error.stack,
      });
      throw new HttpException(
        'Failed to fetch address',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  handleAddressResponse(response: Address) {
    this.logger.log('handleAddressResponse: Processing address response', {
      udprn: response.udprn,
    });

    return {
      buildingNumber: response.building_number,
      line_1: response.line_1,
      line_2: response.line_2,
      street: response.thoroughfare,
      town: response.post_town,
      county: response.county,
      uniqueDeliveryPointReference: response.udprn,
      fullAddress: response.address,
      postCode: response.postcode_compact,
      latitude: response?.geocode?.lattitude ?? '',
      longitude: response?.geocode?.longitude ?? '',
    };
  }

  private generateUrl(
    apiKey: string,
    query: string,
    option: 'udprn' | 'postcodes'
  ) {
    const url = `https://postcode.apitier.com/v1/${option}/${query}?x-api-key=${apiKey}`;
    this.logger.log('generateUrl: Generated URL for API request', {
      option,
      query,
    });
    return url;
  }
}
