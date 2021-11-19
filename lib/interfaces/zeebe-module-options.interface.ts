import {
  FactoryProvider,
  ModuleMetadata,
  Type,
} from '@nestjs/common/interfaces';
import { ZBClientOptions } from 'zeebe-node';

export interface ZeebeModuleOptions extends ZBClientOptions {
  gatewayAddress?: string;
}

export interface ZeebeOptionsFactory {
  createZeebeOptions(): Promise<ZeebeModuleOptions> | ZeebeModuleOptions;
}

export interface ZeebeModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Existing Provider to be used.
   */
  useExisting?: Type<ZeebeOptionsFactory>;

  /**
   * Type (class name) of provider (instance to be registered and injected).
   */
  useClass?: Type<ZeebeOptionsFactory>;

  /**
   * Factory function that returns an instance of the provider to be injected.
   */
  useFactory?: (
    ...args: any[]
  ) => Promise<ZeebeModuleOptions> | ZeebeModuleOptions;

  /**
   * Optional list of providers to be injected into the context of the Factory function.
   */
  inject?: FactoryProvider['inject'];
}
