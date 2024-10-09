import { Module } from '@nestjs/common';
import { UsersController } from '../controllers/users.controller';
import { UsersService } from '../services/users.service';
import { UsersRepository } from '../repository/users.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule, LoggerModule, User } from '@app/common';
import { AddressModule } from './address-user.module';
import { AddressUserService } from '../services/address-user.service';

@Module({
  imports: [
    DatabaseModule,
    LoggerModule,
    AddressModule,
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, AddressUserService],
  exports: [UsersService],
})
export class UsersModule {}
