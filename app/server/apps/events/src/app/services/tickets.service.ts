import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Event, TicketType } from '@app/common';
import { CreateTicketTypeDto } from '../dto/create-ticketType.dto';
import { TicketPhasesService } from './ticketsPhases.service';
import { DataSource, EntityManager } from 'typeorm';
import { TicketTypeRepository } from '../repository/ticket-type.repository';
import { EventRepository } from '../repository/events.repository';
import { UpdateTicketTypeDto } from '../dto/update-ticketType.dto';
import { Logger } from 'nestjs-pino';

@Injectable()
export class TicketsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly ticketTypeRepository: TicketTypeRepository,
    private readonly ticketPhasesService: TicketPhasesService,
    private readonly eventRepository: EventRepository,
    private readonly logger: Logger
  ) {
    this.logger.log('TicketsService initialized');
  }

  async getAllEventTickets(eventId: string): Promise<TicketType[]> {
    this.logger.log('getAllEventTickets: Fetching all tickets for event', {
      eventId,
    });

    try {
      const tickets = await this.ticketTypeRepository.findAll({
        where: { event: { id: eventId } },
      });
      this.logger.log('getAllEventTickets: Tickets fetched successfully', {
        eventId,
        ticketCount: tickets.length,
      });
      return tickets;
    } catch (error) {
      this.logger.error('getAllEventTickets: Failed to fetch tickets', {
        eventId,
        error: error.message,
      });
      throw error;
    }
  }

  async getEventTicketById(ticketId: string): Promise<TicketType> {
    this.logger.log('getEventTicketById: Fetching ticket', { ticketId });

    try {
      const ticket = await this.ticketTypeRepository.findOneById(ticketId);
      if (!ticket) {
        this.logger.warn('getEventTicketById: Ticket not found', {
          ticketId,
        });
        throw new NotFoundException('Ticket was not able to be fetched');
      }
      return ticket;
    } catch (error) {
      this.logger.error('getEventTicketById: Failed to fetch ticket', {
        ticketId,
        error: error.message,
      });
      throw error;
    }
  }

  async createTicket(
    { pricingPhases, ...createTicket }: CreateTicketTypeDto,
    eventId: string
  ): Promise<TicketType[]> {
    this.logger.log('createTicket: Creating new ticket', {
      eventId,
      createTicket,
    });

    return await this.dataSource.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const linkedEvent = await this.eventRepository.findOneById(eventId);

          if (!linkedEvent) {
            this.logger.warn('createTicket: Event not found', {
              eventId,
            });
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

          this.logger.log('createTicket: Ticket saved', {
            ticketId: savedTicket.id,
          });

          if (pricingPhases.length > 0) {
            this.logger.log('createTicket: Creating pricing phases', {
              ticketId: savedTicket.id,
              phaseCount: pricingPhases.length,
            });

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
            this.logger.error(
              'createTicket: Failed to retrieve the created ticket',
              { ticketId: savedTicket.id }
            );

            throw new Error('Failed to retrieve the created ticket');
          }

          this.logger.log('createTicket: Ticket created successfully', {
            ticketId: finalTicket.id,
          });

          return [finalTicket];
        } catch (error) {
          this.logger.error('createTicket: Failed to create ticket', {
            error: error.message,
            pricingPhases: JSON.stringify(pricingPhases),
          });

          throw new InternalServerErrorException(
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
        const ticketDb = await this.getEventTicketById(ticketId);

        if (!ticketDb) {
          this.logger.warn('updateEventTicket: Ticket not found', { ticketId });
          throw new NotFoundException(`Ticket with ID "${ticketId}" not found`);
        }

        try {
          // Update ticket data
          Object.assign(ticketDb, updateTicketData);
          await transactionalEntityManager.save(ticketDb);
          this.logger.log('updateEventTicket: Ticket data updated', {
            ticketId,
          });

          // Handle pricing phases
          if (pricingPhases) {
            if (pricingPhases.create && pricingPhases.create.length > 0) {
              this.logger.log(
                'updateEventTicket: Creating new pricing phases',
                {
                  ticketId,
                  newPhasesCount: pricingPhases.create.length,
                }
              );
              await this.ticketPhasesService.create(
                pricingPhases.create,
                ticketDb,
                transactionalEntityManager
              );
            }
            if (pricingPhases.update && pricingPhases.update.length > 0) {
              this.logger.log('updateEventTicket: Updating pricing phases', {
                ticketId,
                updatedPhasesCount: pricingPhases.update.length,
              });
              await this.ticketPhasesService.update(
                pricingPhases.update,
                transactionalEntityManager
              );
            }
            if (pricingPhases.delete && pricingPhases.delete.length > 0) {
              this.logger.log('updateEventTicket: Deleting pricing phases', {
                ticketId,
                deletedPhasesCount: pricingPhases.delete.length,
              });
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
            this.logger.error(
              'updateEventTicket: Failed to retrieve the updated ticket',
              { ticketId }
            );
            throw new Error('Failed to retrieve the updated ticket');
          }

          this.logger.log('updateEventTicket: Ticket updated successfully', {
            ticketId,
          });

          return updatedTicket;
        } catch (error) {
          throw new InternalServerErrorException(
            `Failed to update ticket: ${error.message}`
          );
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
      this.logger.warn('toggleActiveStatus: Ticket not found', {
        ticketId,
      });

      throw new NotFoundException(`TicketType with ID "${ticketId}" not found`);
    }

    const targetStatus = newStatus ?? !ticketType.isActive;

    if (targetStatus === ticketType.isActive) {
      this.logger.warn(
        'toggleActiveStatus: Ticket is already in the requested state',
        { ticketId, currentStatus: ticketType.isActive }
      );

      throw new BadRequestException(
        'TicketType is already in the requested state'
      );
    }

    if (targetStatus && !ticketType.canBeActive(new Date())) {
      this.logger.warn(
        'toggleActiveStatus: Cannot set ticket to active outside of its sale period',
        { ticketId }
      );

      throw new BadRequestException(
        'Cannot set ticket to active outside of its sale period'
      );
    }

    ticketType.isActive = targetStatus;

    try {
      const updatedTicket = await this.ticketTypeRepository.save(ticketType);
      this.logger.log(
        'toggleActiveStatus: Ticket status updated successfully',
        { ticketId, newStatus: updatedTicket.isActive }
      );
      return updatedTicket;
    } catch (error) {
      this.logger.error('toggleActiveStatus: Failed to update ticket status', {
        ticketId,
        error: error.message,
      });
      throw new BadRequestException(
        `Failed to update ticket status: ${error.message}`
      );
    }
  }

  async deleteEventTicket(ticketId: any) {
    this.logger.log('deleteEventTicket: Deleting ticket', { ticketId });
    const deletedResults = await this.getEventTicketById(ticketId);
    if (!deletedResults) {
      this.logger.warn('deleteEventTicket: Ticket not found', { ticketId });
      throw new NotFoundException(`Ticket with ID "${ticketId}" not found`);
    }

    try {
      const result = await this.ticketTypeRepository.remove(deletedResults);
      this.logger.log('deleteEventTicket: Ticket deleted successfully', {
        ticketId,
      });
      return result;
    } catch (error) {
      this.logger.error('deleteEventTicket: Failed to delete ticket', {
        ticketId,
        error: error.message,
      });
      throw new InternalServerErrorException(
        `Failed to delete ticket with Id:${ticketId}`
      );
    }
  }
}
