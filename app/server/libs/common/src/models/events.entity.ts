import { AbstractEntity, EventAddress } from '@app/common';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { EventsImages } from './events-images.entity';

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

  @OneToMany(() => EventsImages, (image) => image.event)
  images: EventsImages[];

  @Column()
  user: string;

  @Column()
  published: boolean;
}
