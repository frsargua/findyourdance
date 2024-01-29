import { Controller, Post, Body, Res } from '@nestjs/common';
import { AddressApiService } from '../services/address.api.service';
import { Response } from 'express';

@Controller('/find/address/')
export class AddressApiController {
  constructor(private readonly addressApiService: AddressApiService) {}

  @Post('postcode')
  async retrieveAddressByPostcode(
    @Body('postcode') postcode: string,
    @Res() response: Response
  ) {
    const addresses =
      await this.addressApiService.retrieveAddressByPostcode(postcode);
    response.setHeader('Content-Type', 'application/json');
    response.send(addresses);
  }

  @Post('single/address')
  async retrieveSingleAddress(
    @Body('uuid') uuid: string,
    @Res() response: Response
  ) {
    console.log(uuid);
    const addresses = await this.addressApiService.retrieveSingleAddress(uuid);
    response.setHeader('Content-Type', 'application/json');
    response.send(addresses);
  }
}
