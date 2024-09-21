import {
  Entity,
  Index,
  Column,
  Check,
  ManyToOne,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
} from 'typeorm';
import { AbstractEntity, Event, TicketPricingPhase } from '@app/common';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { TimestampColumn } from '../entityValidators/timestampColumn.validator';
import { SalesStrategyEnum } from './enums/ticket-entity-enums';

@Entity()
@Index(['event', 'name'], { unique: true })
@Check(`"sale_end_date" > "sale_start_date"`)
@Check(`"capacity" >= "sold"`)
@Check(`"max_per_customer" <= "capacity"`)
@Check(`"sale_end_date" > CURRENT_TIMESTAMP`)
@Check(`"sale_start_date" >= CURRENT_TIMESTAMP`)
export class TicketType extends AbstractEntity {
  @Column({ length: 100 })
  name: string;
  //I think it would be nice to have the typeORM rules be part of an env file, but might be more boiler plate
  @Column({ type: 'varchar', nullable: false, length: 2000 })
  description: string;

  @TimestampColumn()
  saleStartDate: Date;

  @TimestampColumn()
  saleEndDate: Date;

  @Column({ type: 'integer', default: 0 })
  @Check('capacity >= 0')
  capacity: number;

  @Column({ type: 'integer', default: 0 })
  @Check('sold >= 0')
  sold: number;

  @Column({
    type: 'enum',
    enum: SalesStrategyEnum,
    default: SalesStrategyEnum.FCFS,
    nullable: false,
  })
  salesStrategy: SalesStrategyEnum;

  @Column({ type: 'boolean', default: false, nullable: false })
  allowWaitList: boolean;

  @ManyToOne(() => Event, (event) => event.ticketTypes, { nullable: false })
  event: Event;

  @OneToMany(
    () => TicketPricingPhase,
    (priceChange) => priceChange.ticketType,
    { nullable: false }
  )
  @ValidateNested({ each: true })
  @Type(() => TicketPricingPhase)
  pricingPhases: TicketPricingPhase[];

  @Column({ nullable: true })
  @Check(
    'valid_for_days IS NULL OR valid_for_days > 0 or valid_for_days < 1000'
  )
  validForDays: number;

  @Column({ type: 'boolean', default: true, nullable: false })
  isActive: boolean;

  @Column({ type: 'int', default: 10 })
  @Check('max_per_customer > 0 AND max_per_customer <= capacity')
  maxPerCustomer: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  private _currentPrice: number | null;

  get currentPrice(): number | null {
    return this._currentPrice;
  }

  @AfterLoad()
  calculateCurrentPrice() {
    const now = new Date();
    if (now > this.saleEndDate) {
      this._currentPrice = null;
      return;
    }

    if (!this.pricingPhases || this.pricingPhases.length === 0) {
      this._currentPrice = null;
      return;
    }

    const activePhase = this.pricingPhases
      .filter((phase) => phase.effectiveDate <= now)
      .sort((a, b) => b.effectiveDate.getTime() - a.effectiveDate.getTime())[0];
    this._currentPrice = activePhase ? activePhase.price : null;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async validateDates() {
    if (this.event) {
      if (
        this.saleStartDate > this.event.end_date_time &&
        this.saleEndDate > this.event.end_date_time
      ) {
        throw new Error('Ticket sale dates must be within the event dates');
      }
    }
  }

  async getCurrentPrice(): Promise<number | null | string> {
    //TODO: Temporary fix to my db being 1 h behind, i will have to find a way to use the timestamp better
    const now = new Date(new Date().getTime() + 60 * 60 * 1000);
    if (now < this.saleStartDate) {
      return 'Tickets coming soon';
    }
    if (now > this.saleEndDate) {
      return 'Tickets sale ended';
    }

    if (!this.pricingPhases || this.pricingPhases.length === 0) {
      return 'No pricing information available';
    }

    const currentPhase = this.pricingPhases
      .filter((phase) => phase.effectiveDate <= now)
      .sort((a, b) => b.effectiveDate.getTime() - a.effectiveDate.getTime())[0];
    return currentPhase ? currentPhase.price : 'No active pricing phase found';
  }
}
