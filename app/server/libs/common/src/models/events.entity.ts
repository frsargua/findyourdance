import {
  AbstractEntity,
  EventAddress,
  EventReview,
  EventsImages,
  TicketType,
  TimestampColumn,
} from '@app/common';
import { IsBoolean, IsNotEmpty, MaxLength } from 'class-validator';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Event extends AbstractEntity {
  @Column()
  @IsNotEmpty()
  @MaxLength(30, { message: 'Event name must not exceed 30 characters' })
  event_name: string;

  @TimestampColumn()
  start_date_time: Date;

  @TimestampColumn()
  end_date_time: Date;

  @Column()
  @IsNotEmpty()
  @MaxLength(3000, { message: 'Description must not exceed 3000 characters' })
  description: string;

  @ManyToOne(() => EventAddress, (address) => address.events, {
    nullable: false,
  })
  eventAddress: EventAddress;

  @OneToMany(() => EventsImages, (image) => image.event, { nullable: false })
  images: EventsImages[];

  @OneToMany(() => TicketType, (ticketType) => ticketType.event)
  ticketTypes: TicketType[];

  @OneToMany(() => EventReview, (review) => review.event)
  reviews: EventReview[];

  @Column()
  @IsNotEmpty()
  user: string;

  @Column()
  @IsBoolean()
  published: boolean;

  @Column({ default: false })
  @IsBoolean()
  ticketsRequired: boolean;

  async getCurrentCheapestTicketPrice(): Promise<number | null> {
    if (!this.ticketsRequired) {
      return null;
    }

    const currentPrices = await Promise.all(
      this.ticketTypes.map((ticket) => ticket.getCurrentPrice())
    );

    const validPrices = currentPrices.filter(
      (price) => price !== null
    ) as number[];

    return validPrices.length > 0 ? Math.min(...validPrices) : null;
  }
}
