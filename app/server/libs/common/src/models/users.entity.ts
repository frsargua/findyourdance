import { AbstractEntity, AddressUser } from '@app/common';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class User extends AbstractEntity {
  @Column()
  @IsEmail({}, { message: 'Invalid email address.' })
  email: string;

  @ValidateIf((o) => !o.authProvider)
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password: string;

  @Column({ nullable: true })
  @IsOptional()
  authProvider: string;

  @Column({ nullable: true })
  @ValidateIf((o) => o.authProvider)
  @IsNotEmpty({
    message:
      'Auth provider ID is required when using third-party authentication.',
  })
  authProviderId: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  @IsOptional()
  firstName?: string;

  @Column({ nullable: true })
  @IsOptional()
  lastName?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsPhoneNumber('GB', { message: 'Invalid phone number.' })
  phoneNumber?: string;

  @Column({ nullable: true, type: 'date' })
  @IsOptional()
  @IsDate()
  dateOfBirth?: Date;

  @Column({ default: false })
  @IsBoolean()
  marketingOptIn: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  @IsOptional()
  @IsDate()
  termsAcceptedAt?: Date;

  @Column({ nullable: true })
  @IsOptional()
  pictureUrl?: string;

  @ManyToOne(() => AddressUser, (address) => address.users)
  userAddress: AddressUser;
}
