import { Injectable } from '@nestjs/common';
import { TicketPricingPhase, TicketType } from '@app/common';
import { CreateTicketPricingPhaseDto } from '../dto/create-ticket-price-phase.dto';
import { EntityManager } from 'typeorm';
import { TicketsPhasesRepository } from '../repository/ticketsPhases.repository';

@Injectable()
export class TicketPhasesService {
  constructor(
    private readonly ticketPhasesRepository: TicketsPhasesRepository
  ) {}

  async create(
    pricingPhases: CreateTicketPricingPhaseDto[],
    ticketInstance: TicketType,
    transactionalEntityManager: EntityManager
  ): Promise<TicketPricingPhase[]> {
    // console.log(`Ticket Instance: ${JSON.stringify(ticketInstance)}`);
    const createdPhases = pricingPhases.map((pricingPhase) =>
      transactionalEntityManager.create(TicketPricingPhase, {
        ...pricingPhase,
        ticketType: ticketInstance,
      })
    );

    return await transactionalEntityManager.save(
      TicketPricingPhase,
      createdPhases
    );
  }
}
