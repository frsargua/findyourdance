import { AbstractEntity, EventAddress } from '@app/common';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Event extends AbstractEntity {
  @Column()
  event_name: string;

  @Column()
  start_date_time: Date;

  @Column()
  end_date_time: Date;

  @Column()
  description: string;

  @ManyToOne(() => EventAddress, (address) => address.events)
  eventAddress: EventAddress;

  @Column()
  user: string;
}
