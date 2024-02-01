import { Controller, Get, Post, Put } from '@nestjs/common';
import { GenericAddressService } from '../services/address.service';
import { AddressEventService } from '../services/address-event.service';
import { AddressUserService } from '../services/address-user.service';

@Controller()
export class AddressController {
  constructor(
    private readonly addressService: GenericAddressService,
    private readonly addressUserService: AddressUserService,
    private readonly addressEventService: AddressEventService
  ) {}

  @Get()
  getUserAddress(): string {
    return this.addressUserService.getUserAddress();
  }
  @Get()
  getEventAddress(): string {
    return this.addressEventService.getEventAddress();
  }
  @Get()
  getEventsInAddress(): string {
    return this.addressEventService.getEventsInAddress();
  }
  @Get()
  getUsersInAddress(): string {
    return this.addressUserService.getUsersInAddress();
  }
  @Get()
  updateUserAddress(): string {
    return this.addressUserService.updateUserAddress();
  }

  @Put()
  updateEventAddress(): string {
    return this.addressEventService.updateEventAddress();
  }

  @Post()
  addUserAddress(): string {
    return this.addressUserService.addUserAddress();
  }

  @Post()
  addEventAddress(): string {
    return this.addressEventService.addEventAddress();
  }
}
