import {
  Entity,
  Index,
  Column,
  ManyToOne,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
} from 'typeorm';
import { AbstractEntity, Event, TicketPricingPhase } from '@app/common';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  Max,
  MaxLength,
  Min,
  MinDate,
  ValidateNested,
} from 'class-validator';
import { TimestampColumn } from '../entityValidators/timestampColumn.validator';
import { SalesStrategyEnum } from './enums/ticket-entity-enums';
import { isAfter, isBefore, isEqual } from 'date-fns';
import { BadRequestException } from '@nestjs/common';

@Entity()
@Index(['event', 'name'], { unique: true })
export class TicketType extends AbstractEntity {
  //I think it would be nice to have the typeORM rules be part of an env file, but might be more boiler plate
  @Column({ length: 100 })
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @Column({ type: 'varchar', nullable: false, length: 2000 })
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @TimestampColumn()
  @MinDate(() => new Date(), {
    message: 'Sale start date must not be in the past.',
  })
  saleStartDate: Date;

  @TimestampColumn()
  @MinDate(() => new Date(), {
    message: 'Sale end date must not be in the past.',
  })
  saleEndDate: Date;

  @Column({ type: 'integer', default: 0 })
  @IsInt()
  @Min(0)
  capacity: number;

  @Column({ type: 'integer', default: 0 })
  @IsInt()
  @Min(0)
  sold: number;

  @Column({
    type: 'enum',
    enum: SalesStrategyEnum,
    default: SalesStrategyEnum.FCFS,
    nullable: false,
  })
  salesStrategy: SalesStrategyEnum;

  @Column({ type: 'boolean', default: false, nullable: false })
  @IsBoolean()
  allowWaitList: boolean;

  @ManyToOne(() => Event, (event) => event.ticketTypes, { nullable: false })
  event: Event;

  @OneToMany(
    () => TicketPricingPhase,
    (priceChange) => priceChange.ticketType,
    { nullable: false, cascade: true }
  )
  @ValidateNested({ each: true })
  @Type(() => TicketPricingPhase)
  pricingPhases: TicketPricingPhase[];

  @Column({ nullable: true })
  @Min(1)
  @Max(730)
  validForDays: number;

  @Column({ type: 'boolean', default: true, nullable: false })
  @IsBoolean()
  isPublishable: boolean;

  @Column({ type: 'boolean', default: true, nullable: false })
  @IsBoolean()
  isActive: boolean;

  @Column({ type: 'int', default: 10 })
  @Min(1)
  maxPerCustomer: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  private _currentPrice: number | null;

  @AfterLoad()
  calculateCurrentPrice() {
    this._currentPrice = this.getCurrentPrice();
  }

  get currentPrice(): number | null {
    return this.getCurrentPrice();
  }

  @BeforeInsert()
  @BeforeUpdate()
  async validateDates() {
    const now = new Date();

    if (isAfter(now, this.saleEndDate) || isAfter(now, this.saleStartDate)) {
      throw new BadRequestException(
        `Sale dates cannot be in the past. now: ${now}, startDate: ${this.saleStartDate}`
      );
    }

    if (isAfter(this.saleStartDate, this.saleEndDate)) {
      throw new BadRequestException(
        'Sale start date must be before sale end date.'
      );
    }
    if (this.event) {
      if (
        isAfter(this.saleStartDate, this.event.endDateTime) ||
        isAfter(this.saleEndDate, this.event.endDateTime)
      ) {
        throw new BadRequestException(
          'Ticket sale dates must be within event dates.'
        );
      }
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  async validateFields() {
    if (this.capacity < this.sold) {
      throw new BadRequestException(
        'Capacity cannot be less than sold tickets.'
      );
    }
    if (this.maxPerCustomer >= this.capacity) {
      throw new BadRequestException(
        'Max tickets per customer cannot exceed capacity.'
      );
    }
  }

  canBeActive(currentDate: Date): boolean {
    return (
      (isAfter(currentDate, this.saleStartDate) ||
        isEqual(currentDate, this.saleStartDate)) &&
      (isBefore(currentDate, this.saleEndDate) ||
        isEqual(currentDate, this.saleEndDate))
    );
  }

  getCurrentPrice(): number | null {
    const now = new Date(); // Current UTC timestamp

    if (isBefore(now, this.saleStartDate)) {
      //  'Tickets coming soon';
      return null;
    }

    if (isAfter(now, this.saleEndDate)) {
      //  'Tickets sale ended';
      return null;
    }

    if (!this.pricingPhases || this.pricingPhases.length === 0) {
      // 'No pricing information available';
      return null;
    }

    const currentPhase = this.pricingPhases
      .filter((phase) => phase.effectiveDate <= now)
      .sort((a, b) => b.effectiveDate.getTime() - a.effectiveDate.getTime())[0];

    // 'No active pricing phase found'
    return currentPhase ? currentPhase.price : null;
  }
}
