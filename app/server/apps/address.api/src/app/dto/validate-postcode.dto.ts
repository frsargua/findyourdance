import { IsUKPostcode } from '../decorator/decorators';

export class AddressDTO {
  @IsUKPostcode({ message: 'Invalid UK postcode' })
  postcode: string;
}
