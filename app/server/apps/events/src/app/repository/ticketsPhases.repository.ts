import { BaseAbstractRepostitory, TicketPricingPhase } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TicketsPhasesRepository extends BaseAbstractRepostitory<TicketPricingPhase> {
  protected logger: Logger = new Logger(TicketsPhasesRepository.name);
  constructor(
    @InjectRepository(TicketPricingPhase)
    private readonly ticketsPhasesRepository: Repository<TicketPricingPhase>
  ) {
    super(ticketsPhasesRepository);
  }
}
