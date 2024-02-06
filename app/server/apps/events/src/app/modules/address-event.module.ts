import { Module } from '@nestjs/common';
// import { AddressUserController } from '../controllers/address-user.controller';
import { AddressEvent, DatabaseModule, LoggerModule } from '@app/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressEventRepository } from '../repository/address-event.repository';
import { AddressEventService } from 'apps/address.api/src/app/services/address-event.service';

@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    TypeOrmModule.forFeature([AddressEvent]),
  ],
  // controllers: [AddressUserController],
  providers: [AddressEventService, AddressEventRepository],
  exports: [AddressEventService, AddressEventRepository],
})
export class AddressModule {}
