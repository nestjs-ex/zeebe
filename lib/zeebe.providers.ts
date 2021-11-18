import { OnApplicationShutdown, Provider } from '@nestjs/common';
import { ZBClient } from 'zeebe-node';
import { ZeebeModuleOptions } from './interfaces/zeebe-module-options.interface';
import {
  getZbClientOptionsToken,
  getZbClientToken,
} from './utils';

function buildZbClient(options: ZeebeModuleOptions): ZBClient {
  options.onReady = () => console.log(`Connected!`);
  options.onConnectionError = () => console.log(`Disconnected!`);

  const zbc = new ZBClient(options);

  (zbc as unknown as OnApplicationShutdown).onApplicationShutdown = async function (
    this: ZBClient,
  ) {
    return await this.close();
  };

  return zbc;
}

export function createZbClientOptionProvider(options: ZeebeModuleOptions): Provider {
  return {
    provide: getZbClientOptionsToken(),
    useValue: options,
  };
}

export function createZbClientProvider(): Provider {
  return {
    provide: getZbClientToken(),
    useFactory: (o: ZeebeModuleOptions) => {
      return buildZbClient(o);
    },
    inject: [getZbClientOptionsToken()],
  }
}
