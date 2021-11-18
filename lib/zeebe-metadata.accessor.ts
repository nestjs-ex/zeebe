import { Injectable, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ZEEBE_MODULE_ZEEBE,
  ZEEBE_MODULE_ZEEBE_WORKER,
} from './zeebe.constants';
import { ZeebeWorkerOptions } from './decorators';

@Injectable()
export class ZeebeMetadataAccessor {
  constructor(private readonly reflector: Reflector) { }

  isZeebeComponent(target: Type<any> | Function): boolean {
    if (!target) {
      return false;
    }
    return !!this.reflector.get(ZEEBE_MODULE_ZEEBE, target);
  }

  isZeebeWorker(target: Type<any> | Function): boolean {
    if (!target) {
      return false;
    }
    return !!this.reflector.get(ZEEBE_MODULE_ZEEBE_WORKER, target);
  }

  getZeebeComponentMetadata(target: Type<any> | Function): any {
    return this.reflector.get(ZEEBE_MODULE_ZEEBE, target);
  }

  getZeebeWorkerMetadata(target: Type<any> | Function): ZeebeWorkerOptions | undefined {
    return this.reflector.get(ZEEBE_MODULE_ZEEBE_WORKER, target);
  }
}
