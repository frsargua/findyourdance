import { EventAddress, BaseAbstractRepostitory } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class AddressEventRepository extends BaseAbstractRepostitory<EventAddress> {
  protected logger: Logger = new Logger(AddressEventRepository.name);
  constructor(
    @InjectRepository(EventAddress)
    private readonly addressEventRepository: Repository<EventAddress>,
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) {
    super(addressEventRepository);
  }

  async updateLocation(
    addressId: string,
    latitude: number,
    longitude: number
  ): Promise<void> {
    await this.entityManager.query(
      `UPDATE event_address SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography WHERE id = $3`,
      [longitude, latitude, addressId]
    );
  }
}
