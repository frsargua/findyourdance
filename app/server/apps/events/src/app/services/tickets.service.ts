import { Injectable } from '@nestjs/common';
import { Event, TicketType } from '@app/common';
import { CreateTicketTypeDto } from '../dto/create-ticket.dto';
import { TicketPhasesService } from './ticketsPhases.service';
import { DataSource, EntityManager } from 'typeorm';
import { TicketsRepository } from '../repository/tickets.repository';

@Injectable()
export class TicketsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly ticketsRepository: TicketsRepository,
    private readonly ticketPhasesService: TicketPhasesService
  ) {}

  // async createSingleTicket(
  //   { pricingPhases, ...createTicket }: CreateTicketTypeDto,
  //   linkedEvent: Event
  // ): Promise<TicketType[]> {
  //   const ticketInstance = this.ticketsRepository.create({
  //     ...createTicket,
  //     event: linkedEvent,
  //   });

  //   if (pricingPhases.length > 0) {
  //     const pricingPhasesCreated = await this.ticketPhasesService.create(
  //       pricingPhases,
  //       ticketInstance
  //     );
  //   }

  //   const savedEvent = await this.ticketsRepository.save(ticketInstance);
  //   return savedEvent;
  // }

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

  // async getSingleEvent(id: string, options?: EnableEventOptionsDto) {
  //   const relations = this.getRelationsFromOptions(options);

  //   return await this.eventsRepository.findOneById(id, relations);
  // }

  // async switchEventPublishedStatus(
  //   user: User,
  //   updateEventDto: UpdateEventPublishedStatusDto
  // ) {
  //   const { published: updatingPublished, id } = updateEventDto;

  //   const eventToUpdate = await this.eventsRepository.findOneById(id);

  //   if (!eventToUpdate) throw new NotFoundException('Event not found');

  //   await this.validateEventOwnership(eventToUpdate.id, user.id);

  //   if (updatingPublished === eventToUpdate.published) {
  //     console.error(`The publish status is already: ${updatingPublished}`);
  //     return eventToUpdate;
  //   }

  //   eventToUpdate.published = updatingPublished;

  //   return await this.eventsRepository.save(eventToUpdate);
  // }

  // async deleteSingleEvent(user: User, id: IdParamDto) {
  //   const eventToDelete = await this.eventsRepository.findOneById(id);

  //   if (!eventToDelete) throw new Error('Event not found');

  //   await this.validateEventOwnership(eventToDelete.id, user.id);

  //   return await this.eventsRepository.remove(eventToDelete);
  // }

  // async deleteUserEvents(user: any) {
  //   const deletedResults = await this.eventsRepository.deleteAllEventsByUserId(
  //     user.id
  //   );

  //   return deletedResults;
  // }

  // private async validateEventOwnership(eventId: string, userId: string) {
  //   try {
  //     await this.eventsRepository.findByCondition({
  //       where: {
  //         id: eventId,
  //         user: userId,
  //       },
  //     });
  //   } catch (error) {
  //     throw new ForbiddenException(
  //       'Not allowed to update event, not event owner'
  //     );
  //   }
  // }

  // private getRelationsFromOptions(options?: EnableEventOptionsDto): string[] {
  //   if (!options) return [];

  //   const result = Object.keys(this.relationsMapping)
  //     .filter((key) => options[key as keyof EnableEventOptionsDto])
  //     .map((key) => this.relationsMapping[key]);

  //   console.log(result);

  //   return result;
  // }
}
