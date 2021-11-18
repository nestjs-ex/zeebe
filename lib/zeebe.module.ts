import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ZeebeMetadataAccessor } from './zeebe-metadata.accessor';
import { ZeebeExplorer } from './zeebe.explorer';
import {
  createZbClientOptionProvider,
  createZbClientProvider,
} from './zeebe.providers';
import {
  ZeebeModuleAsyncOptions,
  ZeebeModuleOptions,
  ZeebeOptionsFactory,
} from './interfaces/zeebe-module-options.interface';
import { getZbClientOptionsToken } from './utils/get-queue-options-token.util';

@Module({})
export class ZeebeModule {
  static register(options: ZeebeModuleOptions): DynamicModule {
    const zbClientProvider = createZbClientProvider();
    const zbClientOptionProviders = createZbClientOptionProvider(options);
    
    return {
      module: ZeebeModule,
      imports: [ZeebeModule.registerCore()],
      providers: [zbClientOptionProviders, zbClientProvider],
      exports: [zbClientProvider],
    };
  }

  static registerAsync(options: ZeebeModuleAsyncOptions): DynamicModule {
    const zbClientProvider = createZbClientProvider();
    const asyncZbClientOptionsProviders = this.createAsyncProviders(options);
    
    return {
      imports: (options.imports || []).concat(ZeebeModule.registerCore()),
      module: ZeebeModule,
      providers: [...asyncZbClientOptionsProviders, zbClientProvider],
      exports: [zbClientProvider],
    };
  }

  private static createAsyncProviders(
    options: ZeebeModuleAsyncOptions,
  ): Provider[] {

    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    // if (!options.useClass) {
    //   // fallback to the "registerQueue" in case someone accidentally used the "registerQueueAsync" instead
    //   return [createZbClientOptionProvider(options )];
    // }
    const useClass = options.useClass as Type<ZeebeOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    asyncOptions: ZeebeModuleAsyncOptions
  ): Provider {
    if (asyncOptions.useFactory) {
      return {
        provide: getZbClientOptionsToken(),
        useFactory: async (...factoryArgs: unknown[]) => {
          return {
            ...(await asyncOptions.useFactory(...factoryArgs)),
          };
        },
        inject: [...(asyncOptions.inject || [])],
      };
    }
    // `as Type<ZeebeOptionsFactory>` is a workaround for microsoft/TypeScript#31603
    const inject = [
      (asyncOptions.useClass || asyncOptions.useExisting) as Type<
        ZeebeOptionsFactory
      >,
    ];
    return {
      provide: getZbClientOptionsToken(),
      useFactory: async (
        optionsFactory: ZeebeOptionsFactory,
      ) => {
        return {
          ...(await optionsFactory.createZeebeOptions()),
        };
      },
      inject: [...inject],
    };
  }

  private static registerCore() {
    return {
      global: true,
      module: ZeebeModule,
      imports: [DiscoveryModule],
      providers: [ZeebeExplorer, ZeebeMetadataAccessor],
    };
  }
}
