import { BaseAbstractRepository, TicketPricingPhase } from '@app/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';
import { Repository } from 'typeorm';

@Injectable()
export class TicketPricingPhaseRepository extends BaseAbstractRepository<TicketPricingPhase> {
  constructor(
    @InjectRepository(TicketPricingPhase)
    protected logger: Logger,
    private readonly ticketPricingPhaseRepository: Repository<TicketPricingPhase>
  ) {
    super(logger, ticketPricingPhaseRepository);
  }
}
