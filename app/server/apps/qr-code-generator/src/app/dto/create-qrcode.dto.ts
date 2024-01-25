import { IsUUID } from 'class-validator';

export class CreateQrcode {
  @IsUUID()
  uuid: string;
}
