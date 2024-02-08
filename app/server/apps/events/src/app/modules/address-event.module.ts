import { Module } from '@nestjs/common';
// import { AddressUserController } from '../controllers/address-user.controller';
import { EventAddress, DatabaseModule, LoggerModule } from '@app/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressEventRepository } from '../repository/address-event.repository';
import { AddressEventService } from '../services/address-event.service';

@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    TypeOrmModule.forFeature([EventAddress]),
  ],
  // controllers: [AddressUserController],
  providers: [AddressEventService, AddressEventRepository],
  exports: [AddressEventService, AddressEventRepository],
})
export class AddressModule {}
