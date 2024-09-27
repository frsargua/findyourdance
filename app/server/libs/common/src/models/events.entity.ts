import {
  AbstractEntity,
  EventAddress,
  EventReview,
  EventsImages,
  TicketType,
} from '@app/common';
import { TimestampColumn } from '../entityValidators/timestampColumn.validator';
import { IsBoolean, IsNotEmpty, MaxLength } from 'class-validator';
import { AfterLoad, Column, Entity, ManyToOne, OneToMany } from 'typeorm';

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

  @OneToMany(() => EventsImages, (image) => image.event, { nullable: true })
  images: EventsImages[];

  @OneToMany(() => TicketType, (ticketType) => ticketType.event, {
    cascade: true,
  })
  ticketTypes: TicketType[];

  @OneToMany(() => EventReview, (review) => review.event, {
    cascade: true,
  })
  reviews: EventReview[];

  @Column()
  @IsNotEmpty()
  user: string;

  @Column({ type: 'boolean', default: false, nullable: false })
  ageRestriction: boolean;

  @Column()
  @IsBoolean()
  published: boolean;

  @Column({ default: false })
  @IsBoolean()
  ticketsRequired: boolean;

  private _currentCheapestTicketPrice: number | string | null = null;

  @AfterLoad()
  async calculateCurrentPrice() {
    //TODO: Temporary fix to my db being 1 h behind, i will have to find a way to use the timestamp better
    const now = new Date(new Date().getTime() + 60 * 60 * 1000);
    if (now > this.end_date_time) {
      this._currentCheapestTicketPrice = null;
      return;
    }

    if (
      !this.ticketTypes ||
      this.ticketTypes.length === 0 ||
      this.ticketsRequired
    ) {
      this._currentCheapestTicketPrice = null;
      return;
    }

    const activeTickets = this.ticketTypes
      .filter((phase) => {
        const result = phase.saleStartDate <= now;

        return result;
      })
      .sort((a, b) => b.saleStartDate.getTime() - a.saleStartDate.getTime())[0];

    this._currentCheapestTicketPrice = activeTickets
      ? await activeTickets.getCurrentPrice()
      : null;
  }

  get currentCheapestTicketPrice(): number | null | string {
    return this._currentCheapestTicketPrice;
  }

  async getCurrentCheapestTicketPrice(): Promise<number | null | string> {
    if (!this.ticketsRequired) {
      return null;
    }

    if (this._currentCheapestTicketPrice === null) {
      const currentPrices = await Promise.all(
        this.ticketTypes.map((ticket) => ticket.getCurrentPrice())
      );
      const validPrices = currentPrices.filter(
        (price) => price !== null
      ) as number[];
      this._currentCheapestTicketPrice =
        validPrices.length > 0 ? Math.min(...validPrices) : null;
    }

    return this._currentCheapestTicketPrice;
  }
}
