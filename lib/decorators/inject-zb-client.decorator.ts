import { Inject } from '@nestjs/common';
import { getZbClientToken } from '../utils';

export const InjectZbClient = (): ParameterDecorator =>
  Inject(getZbClientToken());
