import { AbstractEntity } from '@app/common';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'events' })
export class Event extends AbstractEntity {
  @Column()
  event_name: string;

  @Column()
  start_date_time: Date;

  @Column()
  end_date_time: Date;

  @Column()
  description: Date;
}
