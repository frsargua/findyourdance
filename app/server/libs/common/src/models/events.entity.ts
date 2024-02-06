import { AbstractEntity, AddressEvent } from '@app/common';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'events' })
export class Event extends AbstractEntity {
  @Column()
  event_name: string;

  @Column()
  start_date_time: Date;

  @Column()
  end_date_time: Date;

  @Column()
  description: string;

  @ManyToOne(() => AddressEvent, (address) => address.events)
  eventAddress: AddressEvent;
}
