import { Injectable, NotFoundException } from '@nestjs/common';
import { TicketPricingPhase, TicketType } from '@app/common';
import { CreateTicketPricingPhaseDto } from '../dto/create-ticketPricingPhase.dto';
import { EntityManager, In } from 'typeorm';
import { TicketsPhasesRepository } from '../repository/ticketsPhases.repository';
import { UpdateTicketPricingPhaseDto } from '../dto/update-ticketPricingPhase.dto';
import { UuidDTO } from '../dto/iuuid.dto';

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

  async update(
    updateDtos: UpdateTicketPricingPhaseDto[],
    transactionalEntityManager: EntityManager
  ): Promise<TicketPricingPhase[]> {
    const ids = updateDtos
      .map((dto) => dto.id)
      .filter((id) => id !== undefined) as string[];

    if (ids.length === 0) {
      throw new Error('No valid IDs provided for update');
    }

    const existingPhases = await this.ticketPhasesRepository.findAll({
      where: { id: In(ids) },
    });

    if (existingPhases.length !== ids.length) {
      const foundIds = existingPhases.map((phase) => phase.id);
      const missingIds = ids.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `TicketPricingPhases with ids ${missingIds.join(', ')} not found`
      );
    }

    // Update the properties for each phase
    const updatedPhases = existingPhases.map((phase) => {
      const updateDto = updateDtos.find((dto) => dto.id === phase.id);
      if (updateDto) {
        Object.assign(phase, updateDto);
      }
      return phase;
    });

    console.log(updatedPhases);
    // Validate and save the updated entities
    return await transactionalEntityManager.save(
      TicketPricingPhase,
      updatedPhases
    );
  }

  async delete(
    deleteIdArr: UuidDTO['id'][],
    transactionalEntityManager: EntityManager
  ): Promise<void> {
    if (deleteIdArr.length === 0) {
      throw new Error('No valid IDs provided for deletion');
    }

    const existingPhases = await transactionalEntityManager.find(
      TicketPricingPhase,
      {
        where: { id: deleteIdArr[0] },
      }
    );

    if (existingPhases.length !== deleteIdArr.length) {
      const foundIds = existingPhases.map((phase) => phase.id);
      const missingIds = deleteIdArr.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `TicketPricingPhases with ids ${missingIds.join(', ')} not found`
      );
    }

    await transactionalEntityManager.remove(existingPhases);
  }
}
