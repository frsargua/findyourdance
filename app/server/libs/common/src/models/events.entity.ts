import {
  AbstractEntity,
  EventAddress,
  EventReview,
  EventsImages,
  TicketType,
} from '@app/common';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Event extends AbstractEntity {
  @Column()
  event_name: string;

  @Column({ type: 'timestamp' })
  start_date_time: Date;

  @Column({ type: 'timestamp' })
  end_date_time: Date;

  @Column()
  description: string;

  @ManyToOne(() => EventAddress, (address) => address.events)
  eventAddress: EventAddress;

  @OneToMany(() => EventsImages, (image) => image.event)
  images: EventsImages[];

  @OneToMany(() => TicketType, (ticketType) => ticketType.event)
  ticketTypes: TicketType[];

  @OneToMany(() => EventReview, (review) => review.event)
  reviews: EventReview[];
  @Column()
  user: string;

  @Column()
  published: boolean;
}
