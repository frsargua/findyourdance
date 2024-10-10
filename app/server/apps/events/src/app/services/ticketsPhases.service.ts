import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TicketPricingPhase, TicketType } from '@app/common';
import { CreateTicketPricingPhaseDto } from '../dto/create-ticketPricingPhase.dto';
import { EntityManager, In } from 'typeorm';
import { TicketsPhasesRepository } from '../repository/ticketsPhases.repository';
import { UpdateTicketPricingPhaseDto } from '../dto/update-ticketPricingPhase.dto';
import { UuidDTO } from '../dto/iuuid.dto';
import { Logger } from 'nestjs-pino';

@Injectable()
export class TicketPhasesService {
  constructor(
    private readonly ticketPhasesRepository: TicketsPhasesRepository,
    private readonly logger: Logger
  ) {
    this.logger.log('TicketPhasesService initialized');
  }

  async create(
    pricingPhases: CreateTicketPricingPhaseDto[],
    ticketInstance: TicketType,
    transactionalEntityManager: EntityManager
  ): Promise<TicketPricingPhase[]> {
    this.logger.log('create: Creating new ticket pricing phases', {
      ticketId: ticketInstance.id,
      phaseCount: pricingPhases.length,
    });

    if (pricingPhases.length == 0) {
      throw new ForbiddenException(
        `Pricing phases array has a length of 0: ${pricingPhases}`
      );
    }

    const createdPhases = pricingPhases.map((pricingPhase) => {
      try {
        return transactionalEntityManager.create(TicketPricingPhase, {
          ...pricingPhase,
          ticketType: ticketInstance,
        });
      } catch (error) {
        this.logger.error('create: Failed to create ticket pricing phases', {
          ticketId: ticketInstance.id,
          pricingPhase,
          error: error.message,
        });
        throw new InternalServerErrorException(
          `Failed to create ticket pricing phases: ${JSON.stringify(pricingPhase)}`
        );
      }
    });

    return await transactionalEntityManager.save(
      TicketPricingPhase,
      createdPhases
    );
  }

  async update(
    updateDtos: UpdateTicketPricingPhaseDto[],
    transactionalEntityManager: EntityManager
  ): Promise<TicketPricingPhase[]> {
    this.logger.log('update: Updating ticket pricing phases', {
      pricingPhases: updateDtos,
    });

    const ids = updateDtos
      .map((dto) => dto.id)
      .filter((id) => id !== undefined) as string[];

    if (ids.length === 0) {
      throw new ForbiddenException('No valid IDs provided for update');
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
    this.logger.log('delete: Deleting ticket pricing phases', {
      deleteCount: deleteIdArr.length,
    });

    if (deleteIdArr.length === 0) {
      this.logger.warn('delete: No valid IDs provided for deletion');

      throw new ForbiddenException('No valid IDs provided for deletion');
    }

    //TODO: Temporary to have a prove of concept
    const existingPhases = await transactionalEntityManager.find(
      TicketPricingPhase,
      {
        where: { id: deleteIdArr[0] },
      }
    );

    if (existingPhases.length !== deleteIdArr.length) {
      const foundIds = existingPhases.map((phase) => phase.id);

      const missingIds = deleteIdArr.filter((id) => !foundIds.includes(id));

      this.logger.warn('delete: Some pricing phases not found', {
        missingIds,
      });

      throw new NotFoundException(
        `TicketPricingPhases with ids ${missingIds.join(', ')} not found`
      );
    }
    try {
      await transactionalEntityManager.remove(existingPhases);
      this.logger.log('delete: Ticket pricing phases deleted successfully', {
        deletedCount: existingPhases.length,
      });
    } catch (error) {
      this.logger.error('delete: Failed to delete ticket pricing phases', {
        error: error.message,
      });
      throw error;
    }
  }
}
