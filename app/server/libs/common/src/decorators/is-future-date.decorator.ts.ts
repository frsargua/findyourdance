import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export const IsFutureDate = (validationOptions?: ValidationOptions) => {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'isFutureDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (value === null || value === undefined) {
            return true; // Allow optional fields to pass
          }
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Compare dates ignoring time
          const inputDate = new Date(value);
          return inputDate >= today;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a date in the present or future.`;
        },
      },
    });
  };
};
