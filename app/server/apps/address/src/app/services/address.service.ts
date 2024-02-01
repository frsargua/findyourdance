import { Injectable } from '@nestjs/common';

@Injectable()
export class GenericAddressService {
  getHello(): string {
    return 'Hello World!';
  }
}
