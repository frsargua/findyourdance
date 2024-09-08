import {
  Entity,
  Index,
  Column,
  ManyToOne,
  Check,
  BeforeUpdate,
  BeforeInsert,
} from 'typeorm';
import {
  AbstractEntity,
  TicketCategoryEnum,
  TicketType,
  TimestampColumn,
} from '@app/common';
import { ValidateIf, IsNotEmpty } from 'class-validator';

@Entity()
@Index(['ticketType', 'effectiveDate'], { unique: true })
@Check(`"effectiveDate" >= CURRENT_TIMESTAMP`)
@Check(`("ticketType" <> 'Custom' OR "customPhaseName" IS NOT NULL)`)
export class TicketPricingPhase extends AbstractEntity {
  @TimestampColumn()
  effectiveDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  @Check('price >= 0')
  price: number;

  @Column({ type: 'enum', enum: TicketCategoryEnum, nullable: false })
  phaseCategory: TicketCategoryEnum;

  @ManyToOne(() => TicketType, (ticketType) => ticketType.pricingPhases, {
    nullable: false,
  })
  ticketType: TicketType;

  @Column({ nullable: true, length: 255 })
  @ValidateIf((o) => o.phaseCategory === TicketCategoryEnum.CUSTOM)
  @IsNotEmpty({ message: 'Phase name is required for custom pricing strategy' })
  customPhaseName?: string;

  isActive(date: Date = new Date()): boolean {
    return this.effectiveDate <= date && date <= this.ticketType.saleEndDate;
  }

  getDisplayName(): string {
    if (this.phaseCategory === TicketCategoryEnum.CUSTOM) {
      return this.customPhaseName || 'Custom';
    }
    return this.phaseCategory;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async validateEffectiveDate() {
    if (this.ticketType) {
      if (
        this.effectiveDate < this.ticketType.saleStartDate ||
        this.effectiveDate > this.ticketType.saleEndDate
      ) {
        throw new Error(
          'Pricing phase effective date must be within the ticket type sale dates'
        );
      }
    }
  }
}
