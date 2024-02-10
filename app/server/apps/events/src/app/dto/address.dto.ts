import {
  IsString,
  IsOptional,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

export class CreateAddressDto {
  @IsOptional()
  @IsString()
  buildingNumber: string;

  @IsNotEmpty()
  @IsString()
  line1: string;

  @IsOptional()
  @IsString()
  line2: string;

  @IsNotEmpty()
  @IsString()
  street: string;

  @IsNotEmpty()
  @IsString()
  town: string;

  @IsOptional()
  @IsString()
  county: string;

  @IsOptional()
  @IsString()
  uniqueDeliveryPointRef: string;

  @IsNotEmpty()
  @IsString()
  postCode: string;

  @IsNotEmpty()
  @IsNumber()
  @IsLatitude()
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  @IsLongitude()
  longitude: number;
}
