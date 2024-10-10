import { EventAddress, BaseAbstractRepository } from '@app/common';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class EventAddressRepository extends BaseAbstractRepository<EventAddress> {
  constructor(
    protected logger: Logger,
    @InjectRepository(EventAddress)
    private readonly eventAddressRepository: Repository<EventAddress>,
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) {
    super(logger, eventAddressRepository);
  }

  async updateLocation(
    addressId: string,
    latitude: number,
    longitude: number
  ): Promise<void> {
    try {
      await this.entityManager.query(
        `UPDATE event_address SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography WHERE id = $3`,
        [longitude, latitude, addressId]
      );
      this.logger.log(`Location updated for addressId=${addressId}`);
    } catch (error) {
      this.logger.error(
        `Failed to update location for addressId=${addressId}`,
        { error }
      );
      throw new InternalServerErrorException('Failed to update location.');
    }
  }
}
