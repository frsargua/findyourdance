import { BaseAbstractRepostitory, TicketType } from '@app/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';
import { Repository } from 'typeorm';

@Injectable()
export class TicketsRepository extends BaseAbstractRepostitory<TicketType> {
  // protected logger: Logger = new Logger(TicketsRepository.name);
  constructor(
    @InjectRepository(TicketType)
    private readonly ticketsRepository: Repository<TicketType>,
    protected logger: Logger
  ) {
    super(logger, ticketsRepository);
  }
}
