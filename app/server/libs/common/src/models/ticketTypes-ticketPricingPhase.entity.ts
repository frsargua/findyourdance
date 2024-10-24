import {
  Entity,
  Index,
  Column,
  ManyToOne,
  BeforeUpdate,
  BeforeInsert,
} from 'typeorm';
import { AbstractEntity, TicketType } from '@app/common';
import { ValidateIf, IsNotEmpty, MinDate, Min } from 'class-validator';
import { TicketCategoryEnum } from './enums/ticket-entity-enums';
import { TimestampColumn } from '../entityValidators/timestampColumn.validator';
import { isBefore, isAfter, isEqual } from 'date-fns';
import { BadRequestException } from '@nestjs/common';
import { Expose } from 'class-transformer';

@Entity()
@Index(['ticketType', 'effectiveDate', 'phaseCategory'], { unique: true })
// @Check(`"effective_date" >= CURRENT_DATE`) TODO: Find a way to replace this with an virtual method
export class TicketPricingPhase extends AbstractEntity {
  @TimestampColumn()
  @MinDate(() => new Date(), {
    message: 'Effective date must not be in the past.',
  })
  effectiveDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  @Min(0, { message: 'Price must be a non-negative value.' })
  price: number;

  @Column({ type: 'enum', enum: TicketCategoryEnum, nullable: false })
  phaseCategory: TicketCategoryEnum;

  @Column({ nullable: true, length: 255 })
  @ValidateIf((o) => o.phaseCategory === TicketCategoryEnum.CUSTOM)
  @IsNotEmpty({ message: 'Phase name is required for custom pricing strategy' })
  customPhaseName?: string;

  @ManyToOne(() => TicketType, (ticketType) => ticketType.pricingPhases, {
    nullable: false,
    onDelete: 'CASCADE',
    eager: true,
  })
  ticketType: TicketType;

  @Expose()
  get isActive(): boolean {
    const now = new Date();

    if (!this.ticketType?.saleStartDate || !this.ticketType?.saleEndDate) {
      return false;
    }

    return (
      (isBefore(this.effectiveDate, now) || isEqual(this.effectiveDate, now)) &&
      isBefore(now, this.ticketType.saleEndDate) &&
      (isAfter(now, this.ticketType.saleStartDate) ||
        isEqual(now, this.ticketType.saleStartDate))
    );
  }

  @BeforeInsert()
  @BeforeUpdate()
  validateEffectiveDate() {
    if (this.ticketType) {
      const { saleStartDate, saleEndDate } = this.ticketType;
      if (!saleStartDate || !saleEndDate) {
        throw new BadRequestException(
          'Ticket type must have both sale start date and sale end date defined.'
        );
      }
      if (
        isBefore(this.effectiveDate, saleStartDate) ||
        isAfter(this.effectiveDate, saleEndDate)
      ) {
        throw new BadRequestException(
          'Effective date must be within the ticket type sale start and end dates.'
        );
      }
    }
  }

  @Expose()
  get displayPhaseName(): string {
    if (this.phaseCategory === TicketCategoryEnum.CUSTOM) {
      return this.customPhaseName || '';
    }
    return this.phaseCategory.toString();
  }
}
