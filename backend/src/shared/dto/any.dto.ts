import { IsObject } from 'class-validator';

export class AnyDto {
  @IsObject()
  data: any;

  [key: string]: any;
}
