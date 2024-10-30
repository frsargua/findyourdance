import { Entity, OneToMany } from 'typeorm';
import { Event } from './events.entity';
import { GenericAddress } from './generic-address.entity';

@Entity()
export class EventAddress extends GenericAddress {
  @OneToMany(() => Event, (event) => event.eventAddress)
  events: Event[];
}
