import { BaseAbstractRepository, TicketType } from '@app/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';
import { Repository } from 'typeorm';

@Injectable()
export class TicketTypeRepository extends BaseAbstractRepository<TicketType> {
  constructor(
    protected logger: Logger,
    @InjectRepository(TicketType)
    private readonly ticketTypeRepository: Repository<TicketType>
  ) {
    super(logger, ticketTypeRepository);
  }
}
