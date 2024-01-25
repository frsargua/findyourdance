import { IsUUID } from 'class-validator';

export class CreateQrcode {
  @IsUUID('all', { each: true })
  uuid: string;
}
