import { Entity, Index, Column, ManyToOne, Check } from 'typeorm';
import { AbstractEntity, TicketCategoryEnum, TicketType } from '@app/common';
import { ValidateIf, IsNotEmpty } from 'class-validator';

@Entity()
@Index(['ticketType', 'effectiveDate'], { unique: true })
@Check(`"effectiveDate" >= CURRENT_TIMESTAMP`)
@Check(`("ticketType" <> 'Custom' OR "customPhaseName" IS NOT NULL)`)
export class TicketPricingPhase extends AbstractEntity {
  @Column({ type: 'timestamp' })
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

  getDisplayName(): string {
    if (this.phaseCategory === TicketCategoryEnum.CUSTOM) {
      return this.customPhaseName || 'Custom';
    }
    return this.phaseCategory;
  }
}
