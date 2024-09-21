import {
  Entity,
  Index,
  Column,
  ManyToOne,
  Check,
  BeforeUpdate,
  BeforeInsert,
  AfterLoad,
} from 'typeorm';
import { AbstractEntity, TicketType } from '@app/common';
import { ValidateIf, IsNotEmpty } from 'class-validator';
import { TicketCategoryEnum } from './enums/ticket-entity-enums';
import { TimestampColumn } from '../entityValidators/timestampColumn.validator';

@Entity()
@Index(['ticketType', 'effectiveDate', 'phaseCategory'], { unique: true })
@Check(`"effective_date" >= CURRENT_DATE`)
@Check(
  `("phase_category" <> '${TicketCategoryEnum.CUSTOM}' OR "custom_phase_name" IS NOT NULL)`
)
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
    eager: true,
  })
  ticketType: TicketType;

  @Column({ nullable: true, length: 255 })
  @ValidateIf((o) => o.phaseCategory === TicketCategoryEnum.CUSTOM)
  @IsNotEmpty({ message: 'Phase name is required for custom pricing strategy' })
  customPhaseName?: string;

  private _isActive: boolean | null = null;

  @AfterLoad()
  computeIsActive() {
    const now = new Date();
    if (this.ticketType && this.ticketType.saleEndDate) {
      this._isActive =
        this.effectiveDate <= now && now <= this.ticketType.saleEndDate;
    } else {
      this._isActive = null;
    }
  }

  get isActive(): boolean {
    const now = new Date();
    return this.effectiveDate <= now && now < this.ticketType.saleEndDate;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async validateEffectiveDate() {
    if (this.ticketType) {
      if (this.effectiveDate >= this.ticketType.saleEndDate) {
        throw new Error(
          'Pricing phase effective date must be within the ticket type sale dates'
        );
      }
    }
  }

  @AfterLoad()
  setCustomPhaseName() {
    if (this.phaseCategory !== TicketCategoryEnum.CUSTOM) {
      this.customPhaseName = this.phaseCategory;
    }
  }
}
