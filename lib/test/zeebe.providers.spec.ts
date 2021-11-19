import { FactoryProvider } from '@nestjs/common';
import { ZBClient } from 'zeebe-node';
import { ZeebeModuleOptions } from '../interfaces/zeebe-module-options.interface';
import * as zeebeProviders from '../zeebe.providers';

describe('Providers', () => {
  describe('createZbClientProvider', () => {
    it("should use top-level queue name if it's not specified in factory options", async () => {
      const moduleOptions: ZeebeModuleOptions = { gatewayAddress: 'localhost:26500' };
      const provider = zeebeProviders.createZbClientProvider() as FactoryProvider<ZBClient>;

      let zbClient = await provider.useFactory(moduleOptions);
      expect(zbClient.gatewayAddress).toEqual(moduleOptions.gatewayAddress);
      await zbClient.close();
    });
  });
});
