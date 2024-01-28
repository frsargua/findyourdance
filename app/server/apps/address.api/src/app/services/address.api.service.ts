import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AddressApiService {
  private apiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private httpService: HttpService
  ) {}

  async retrieveAddressByPostcode(postcode: string) {
    const apiKey = this.configService.get('GET_ADDRESS_API');

    const url = this.generateUrl(apiKey, postcode);

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {},
        })
      );
      return response.data.result.addresses;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  private generateUrl(apiKey: string, query: string) {
    return `https://postcode.apitier.com/v1/postcodes/${query}?x-api-key=${apiKey}`;
  }
}
