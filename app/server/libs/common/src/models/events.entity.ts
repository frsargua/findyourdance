import {
  AbstractEntity,
  EventAddress,
  EventReview,
  EventsImages,
  TicketType,
} from '@app/common';
import { TimestampColumn } from '../entityValidators/timestampColumn.validator';
import { IsBoolean, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Event extends AbstractEntity {
  @Column()
  @IsNotEmpty()
  @MaxLength(30, { message: 'Event name must not exceed 30 characters' })
  eventName: string;

  @TimestampColumn()
  startDateTime: Date;

  @TimestampColumn()
  endDateTime: Date;

  @Column()
  @IsNotEmpty()
  @MaxLength(3000, { message: 'Description must not exceed 3000 characters' })
  description: string;

  @ManyToOne(() => EventAddress, (address) => address.events, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  eventAddress: EventAddress;

  @OneToMany(() => EventsImages, (image) => image.event, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  images: EventsImages[];

  @OneToMany(() => TicketType, (ticketType) => ticketType.event, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  ticketTypes: TicketType[];

  @OneToMany(() => EventReview, (review) => review.event, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  reviews: EventReview[];

  @Column()
  @IsNotEmpty()
  @IsUUID('4', { message: 'Reviewer must be a valid UUID.' })
  user: string;

  @Column({ type: 'boolean', default: false })
  ageRestriction: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  published: boolean;

  @Column({ type: 'boolean', default: false, nullable: false })
  @IsBoolean()
  ticketsRequired: boolean;

  async getCurrentCheapestTicketPrice(): Promise<number | null> {
    if (
      !this.ticketsRequired ||
      !this.ticketTypes ||
      this.ticketTypes.length === 0
    ) {
      return null;
    }

    const now = new Date();

    const activeTickets = this.ticketTypes.filter((ticket) =>
      ticket.canBeActive(now)
    );

    if (activeTickets.length === 0) {
      return null;
    }

    const currentPrices = await Promise.all(
      activeTickets.map((ticket) => ticket.getCurrentPrice())
    );

    const validPrices = currentPrices.filter(
      (price) => price !== null
    ) as number[];

    const result = validPrices.length > 0 ? Math.min(...validPrices) : null;

    return result;
  }
}
