import { BeforeInsert, BeforeUpdate, Column, Point } from 'typeorm';
import { AbstractEntity } from '../database';
import {
  IsDefined,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsPostalCode,
  IsString,
  MaxLength,
} from 'class-validator';
import { NotAcceptableException } from '@nestjs/common';

export class GenericAddress extends AbstractEntity {
  @Column({ nullable: true })
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(10, { message: 'Building number must not exceed 10 characters.' })
  buildingNumber: string;

  @Column()
  @IsNotEmpty({ message: 'Line 1 is required.' })
  @IsString()
  @MaxLength(255, { message: 'Line 1 must not exceed 255 characters.' })
  line1: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  line2: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  street: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  town: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  county: string;

  @Column({ nullable: true })
  uniqueDeliveryPointReference: string;

  @Column({ length: 20 })
  @IsNotEmpty()
  @IsPostalCode('GB', { message: 'Invalid UK postal code.' })
  postCode: string;

  @Column('double precision')
  @IsDefined()
  @IsLatitude({ message: 'Invalid latitude value.' })
  latitude: number;

  @Column('double precision')
  @IsDefined()
  @IsLongitude({ message: 'Invalid longitude value.' })
  longitude: number;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: Point;

  @BeforeInsert()
  @BeforeUpdate()
  updateLocation() {
    if (this.latitude != null && this.longitude != null) {
      this.location = {
        type: 'Point',
        coordinates: [this.longitude, this.latitude],
      };
    } else {
      throw new NotAcceptableException(
        'Error when trying to save the location coordinates.'
      );
    }
  }
}
