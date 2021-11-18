import { InjectableOptions, SetMetadata } from '@nestjs/common';
import { SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants';
import { ZEEBE_MODULE_ZEEBE } from '../zeebe.constants';


export function Zeebe(): ClassDecorator;
export function Zeebe(options?: InjectableOptions): ClassDecorator {
  const opts = options && typeof options === 'object' ? options : {};

  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Function) => {
    SetMetadata(SCOPE_OPTIONS_METADATA, opts)(target);
    SetMetadata(ZEEBE_MODULE_ZEEBE, opts)(target);
  };
}
