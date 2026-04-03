import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class DefaultValuePipe implements PipeTransform<any> {
  constructor(private readonly defaultValue: any) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (value === null || value === undefined || value === '') {
      return this.defaultValue;
    }
    return value;
  }
}
