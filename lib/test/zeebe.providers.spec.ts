import { FactoryProvider } from '@nestjs/common';
import { ZBClient } from 'zeebe-node';
import { ZeebeModuleOptions } from '../interfaces/zeebe-module-options.interface';
import * as zeebeProviders from '../zeebe.providers';

describe('Providers', () => {
  describe('createZbClientProvider', () => {
    it("should use top-level queue name if it's not specified in factory options", async () => {
      const moduleOptions: ZeebeModuleOptions = { hostname: 'localhost', port: '26500' };
      const factoryModuleOptions: ZeebeModuleOptions = { hostname: 'localhost', port: '26500', loglevel: 'DEBUG' };
      const provider = zeebeProviders.createZbClientProvider() as FactoryProvider<ZBClient>;

      let zbClient = provider.useFactory(moduleOptions);
      expect(zbClient.loglevel).toEqual('INFO');
      await zbClient.close();

      zbClient = provider.useFactory(factoryModuleOptions);
      expect(zbClient.loglevel).toEqual('DEBUG');
      await zbClient.close();
    });
  });
});
