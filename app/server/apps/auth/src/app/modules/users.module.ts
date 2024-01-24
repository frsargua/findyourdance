import { Module } from '@nestjs/common';
import { UsersController } from '../controllers/users.controller';
import { UsersService } from '../services/users.service';
import { UsersRepository } from '../repository/users.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../model/users.entity';
import { DatabaseModule } from '@app/common';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
