import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsUKPostcode(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isUKPostcode',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          const regex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
          return typeof value === 'string' && regex.test(value);
        },
      },
    });
  };
}
