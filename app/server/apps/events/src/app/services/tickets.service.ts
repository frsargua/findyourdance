import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Event, TicketType } from '@app/common';
import { CreateTicketTypeDto } from '../dto/create-ticketType.dto';
import { TicketPhasesService } from './ticketsPhases.service';
import { DataSource, EntityManager } from 'typeorm';
import { TicketsRepository } from '../repository/tickets.repository';
import { EventsRepository } from '../repository/events.repository';
import { UpdateTicketTypeDto } from '../dto/update-ticketType.dto';

@Injectable()
export class TicketsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly ticketsRepository: TicketsRepository,
    private readonly ticketPhasesService: TicketPhasesService,
    private readonly eventRepository: EventsRepository
  ) {}

  async getAllEventTickets(eventId: string): Promise<TicketType[]> {
    const tickets = await this.ticketsRepository.findAll({
      where: { event: { id: eventId } },
    });

    return tickets;
  }

  async getEventTicketById(ticketId: string): Promise<TicketType> {
    const ticket = await this.ticketsRepository.findOneById(ticketId);
    return ticket;
  }

  async createTicket(
    { pricingPhases, ...createTicket }: CreateTicketTypeDto,
    eventId: string
  ): Promise<TicketType[]> {
    return await this.dataSource.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const linkedEvent = await this.eventRepository.findOneById(eventId);

          if (!linkedEvent) {
            throw new NotFoundException(`Event with ID "${eventId}" not found`);
          }

          const ticketInstance = transactionalEntityManager.create(TicketType, {
            ...createTicket,
            event: linkedEvent,
          });

          const savedTicket = await transactionalEntityManager.save(
            TicketType,
            ticketInstance
          );

          if (pricingPhases.length > 0) {
            await this.ticketPhasesService.create(
              pricingPhases,
              savedTicket,
              transactionalEntityManager
            );
          }

          const finalTicket = await transactionalEntityManager.findOne(
            TicketType,
            {
              where: { id: savedTicket.id },
              relations: ['pricingPhases', 'event'],
            }
          );

          if (!finalTicket) {
            throw new Error('Failed to retrieve the created ticket');
          }

          return [finalTicket];
        } catch (error) {
          throw new Error(
            `Failed to create ticket: ${error.message}` +
              JSON.stringify(pricingPhases)
          );
        }
      }
    );
  }

  async createSingleTicket(
    { pricingPhases, ...createTicket }: CreateTicketTypeDto,
    linkedEvent: Event
  ): Promise<TicketType[]> {
    // console.log(`Example: ${JSON.stringify(pricingPhases)}`);

    //TODO: Double check what dataSource is and where to actually place it (repository, service or just call it wherever?)
    return await this.dataSource.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const ticketInstance = transactionalEntityManager.create(TicketType, {
            ...createTicket,
            event: linkedEvent,
          });

          const savedTicket = await transactionalEntityManager.save(
            TicketType,
            ticketInstance
          );

          if (pricingPhases.length > 0) {
            await this.ticketPhasesService.create(
              pricingPhases,
              savedTicket, // Use the saved ticket with ID
              transactionalEntityManager
            );
          }

          const finalTicket = await transactionalEntityManager.findOne(
            TicketType,
            {
              where: { id: savedTicket.id },
              relations: ['pricingPhases', 'event'],
            }
          );

          if (!finalTicket) {
            throw new Error('Failed to retrieve the created ticket');
          }

          return [finalTicket];
        } catch (error) {
          throw new Error(
            `Failed to create ticket: ${error.message}` +
              JSON.stringify(pricingPhases)
          );
        }
      }
    );
  }

  async updateEventTicket(
    ticketId: any,
    { pricingPhases, ...updateTicketData }: UpdateTicketTypeDto
  ) {
    return await this.dataSource.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const ticketDb = await this.getEventTicketById(ticketId);

          if (!ticketDb) {
            throw new NotFoundException(
              `Ticket with ID "${ticketDb}" not found`
            );
          }

          // Update ticket data
          Object.assign(ticketDb, updateTicketData);
          await transactionalEntityManager.save(ticketDb);

          // Handle pricing phases
          if (pricingPhases) {
            if (pricingPhases.create && pricingPhases.create.length > 0) {
              await this.ticketPhasesService.create(
                pricingPhases.create,
                ticketDb,
                transactionalEntityManager
              );
            }
            if (pricingPhases.update && pricingPhases.update.length > 0) {
              await this.ticketPhasesService.update(
                pricingPhases.update,
                transactionalEntityManager
              );
            }
            if (pricingPhases.delete && pricingPhases.delete.length > 0) {
              const arrayOfPricingPhasesToDelete = pricingPhases.delete.map(
                (phase) => phase.id
              );
              await this.ticketPhasesService.delete(
                arrayOfPricingPhasesToDelete,
                transactionalEntityManager
              );
            }
          }

          const updatedTicket = await transactionalEntityManager.findOne(
            TicketType,
            {
              where: { id: ticketId },
              relations: ['pricingPhases'],
            }
          );

          if (!updatedTicket) {
            throw new Error('Failed to retrieve the created ticket');
          }

          return updatedTicket;
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw error;
          }
          throw new Error(`Failed to update ticket: ${error.message}`);
        }
      }
    );
  }

  async toggleActiveStatus(
    ticketId: string,
    newStatus?: boolean
  ): Promise<TicketType> {
    const ticketType = await this.getEventTicketById(ticketId);

    if (!ticketType) {
      throw new NotFoundException(`TicketType with ID "${ticketId}" not found`);
    }

    const targetStatus = newStatus ?? !ticketType.isActive;

    if (targetStatus === ticketType.isActive) {
      throw new BadRequestException(
        'TicketType is already in the requested state'
      );
    }

    if (targetStatus && !ticketType.canBeActive(new Date())) {
      throw new BadRequestException(
        'Cannot set ticket to active outside of its sale period'
      );
    }

    ticketType.isActive = targetStatus;

    try {
      return await this.ticketsRepository.save(ticketType);
    } catch (error) {
      throw new BadRequestException(
        `Failed to update ticket status: ${error.message}`
      );
    }
  }

  async deleteEventTicket(ticketId: any) {
    const deletedResults = await this.getEventTicketById(ticketId);
    const result = await this.ticketsRepository.remove(deletedResults);
    return result;
  }
}
