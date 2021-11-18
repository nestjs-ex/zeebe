import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createContextId, DiscoveryService, ModuleRef } from '@nestjs/core';
import { Injector } from '@nestjs/core/injector/injector';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { ZBClient, ZBWorkerTaskHandler } from 'zeebe-node';
import { ZeebeMetadataAccessor } from './zeebe-metadata.accessor';
import { ZeebeWorkerOptions } from './decorators';
import { getZbClientToken } from './utils';

@Injectable()
export class ZeebeExplorer implements OnModuleInit {
  private readonly logger = new Logger('BullModule');
  private readonly injector = new Injector();

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: ZeebeMetadataAccessor,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  onModuleInit() {
    this.explore();
  }

  explore() {
    const providers: InstanceWrapper[] = this.discoveryService
      .getProviders()
      .filter((wrapper: InstanceWrapper) =>
        this.metadataAccessor.isZeebeComponent(
          // NOTE: Regarding the ternary statement below,
          // - The condition `!wrapper.metatype` is because when we use `useValue`
          // the value of `wrapper.metatype` will be `null`.
          // - The condition `wrapper.inject` is needed here because when we use
          // `useFactory`, the value of `wrapper.metatype` will be the supplied
          // factory function.
          // For both cases, we should use `wrapper.instance.constructor` instead
          // of `wrapper.metatype` to resolve zeebe's class properly.
          // But since calling `wrapper.instance` could degrade overall performance
          // we must defer it as much we can. But there's no other way to grab the
          // right class that could be annotated with `@Zeebe()` decorator
          // without using this property.
          !wrapper.metatype || wrapper.inject
            ? wrapper.instance?.constructor
            : wrapper.metatype,
        ),
      );
    const zbClient = this.moduleRef.get<ZBClient>(getZbClientToken(), { strict: false });

    providers.forEach((wrapper: InstanceWrapper) => {
      const { instance } = wrapper;
      const isRequestScoped = !wrapper.isDependencyTreeStatic();

      this.metadataScanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        (key: string) => {
          if (this.metadataAccessor.isZeebeWorker(instance[key])) {
            const metadata = this.metadataAccessor.getZeebeWorkerMetadata(
              instance[key],
            );
            this.handleZeebeWorker(
              instance,
              key,
              zbClient,
              wrapper.host,
              isRequestScoped,
              metadata,
            );
          }
        },
      );
    });
  }

  handleZeebeWorker(
    instance: object,
    key: string,
    zbClient: ZBClient,
    moduleRef: Module,
    isRequestScoped: boolean,
    options: ZeebeWorkerOptions,
  ) {
    if (isRequestScoped) {
      const handler: ZBWorkerTaskHandler = async (
        ...args: unknown[]
      ) => {
        const contextId = createContextId();

        if (this.moduleRef.registerRequestByContextId) {
          // Additional condition to prevent breaking changes in
          // applications that use @nestjs/bull older than v7.4.0.
          const jobRef = args[0];
          this.moduleRef.registerRequestByContextId(jobRef, contextId);
        }

        const contextInstance = await this.injector.loadPerContext(
          instance,
          moduleRef,
          moduleRef.providers,
          contextId,
        );
        return contextInstance[key].call(contextInstance, ...args);
      };
      options.taskHandler = handler;
    } else {
      options.taskHandler = instance[key].bind(instance) as ZBWorkerTaskHandler;
    }

    zbClient.createWorker(options);
  }
}
