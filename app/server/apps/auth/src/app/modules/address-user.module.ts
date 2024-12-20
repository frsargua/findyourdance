import { Module } from '@nestjs/common';
// import { AddressUserController } from '../controllers/address-user.controller';
import { AddressUser, DatabaseModule, LoggerModule } from '@app/common';
import { AddressUserService } from '../services/address-user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressUserRepository } from '../repository/address-user.repository';

@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    TypeOrmModule.forFeature([AddressUser]),
  ],
  // controllers: [AddressUserController],
  providers: [AddressUserService, AddressUserRepository],
  exports: [AddressUserService, AddressUserRepository],
})
export class AddressModule {}
