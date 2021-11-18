import { MetadataScanner } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ZBClient } from 'zeebe-node';
import { ZeebeModule, getZbClientToken, Zeebe } from '../lib';

describe('ZeebeModule', () => {
  describe('register', () => {
    let moduleRef: TestingModule;

    describe('single configuration', () => {
      beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
          imports: [
            ZeebeModule.register({
              hostname: 'localhost',
              port: '26500',
              loglevel: 'DEBUG'
            }),
          ],
        }).compile();
      });
      afterAll(async () => {
        await moduleRef.close();
      });
      it('should inject the zeebe client with the given loglevel', () => {
        const zbClient = moduleRef.get<ZBClient>(getZbClientToken());

        expect(zbClient).toBeDefined();
        expect(zbClient.loglevel).toEqual('DEBUG');
      });
    });
  });

  describe('registerAsync', () => {
    let moduleRef: TestingModule;

    describe('single configuration', () => {
      describe('useFactory', () => {
        beforeAll(async () => {
          moduleRef = await Test.createTestingModule({
            imports: [
              ZeebeModule.registerAsync({
                useFactory: () => ({
                  hostname: 'localhost',
                  port: '26500',
                  loglevel: 'DEBUG'
                }),
              }),
            ],
          }).compile();
        });
        afterAll(async () => {
          await moduleRef.close();
        });
        it('should inject the zeebe client with the given loglevel', () => {
          const zbClient = moduleRef.get<ZBClient>(getZbClientToken());
          expect(zbClient).toBeDefined();
          expect(zbClient.loglevel).toEqual('DEBUG');
        });
      });
    });
  });

  describe('handles all kind of valid zeebe providers', () => {
    @Zeebe()
    class MyZeebeA { }

    @Zeebe()
    class MyZeebeB { }

    @Zeebe()
    class MyZeebeC { }

    let testingModule: TestingModule;

    let metadataScanner: MetadataScanner;

    beforeAll(async () => {
      testingModule = await Test.createTestingModule({
        imports: [
          ZeebeModule.register({
            hostname: 'localhost',
            port: '26500',
            loglevel: 'DEBUG'
          }),
        ],
        providers: [
          {
            provide: 'A',
            useClass: MyZeebeA,
          },
          {
            provide: 'B',
            useValue: new MyZeebeB(),
          },
          {
            provide: 'C',
            useFactory: () => new MyZeebeC(),
          },
        ],
      }).compile();

      metadataScanner = testingModule.get(MetadataScanner);
      jest.spyOn(metadataScanner, 'scanFromPrototype');

      await testingModule.init();
    });
    afterAll(async () => {
      await testingModule.close();
    });

    it('should use MetadataScanner#scanFromPrototype when exploring', () => {
      expect(metadataScanner.scanFromPrototype).toHaveBeenCalled();
    });

    it('should reach the processor supplied with `useClass`', () => {
      const scanPrototypeCalls = jest.spyOn(
        metadataScanner,
        'scanFromPrototype',
      ).mock.calls;

      const scanPrototypeCallsFirstArgsEveryCall = scanPrototypeCalls.flatMap(
        (args) => args[0],
      );

      expect(
        scanPrototypeCallsFirstArgsEveryCall.some(
          (instanceWrapperInstance) =>
            instanceWrapperInstance.constructor.name === MyZeebeA.name,
        ),
      ).toBeTruthy();
    });

    it('should reach the processor supplied with `useValue`', () => {
      const scanPrototypeCalls = jest.spyOn(
        metadataScanner,
        'scanFromPrototype',
      ).mock.calls;

      const scanPrototypeCallsFirstArgsEveryCall = scanPrototypeCalls.flatMap(
        (args) => args[0],
      );

      expect(
        scanPrototypeCallsFirstArgsEveryCall.some(
          (instanceWrapperInstance) =>
            instanceWrapperInstance.constructor.name === MyZeebeB.name,
        ),
      ).toBeTruthy();
    });

    it('should reach the processor supplied with `useFactory`', () => {
      const scanPrototypeCalls = jest.spyOn(
        metadataScanner,
        'scanFromPrototype',
      ).mock.calls;

      const scanPrototypeCallsFirstArgsEveryCall = scanPrototypeCalls.flatMap(
        (args) => args[0],
      );

      expect(
        scanPrototypeCallsFirstArgsEveryCall.some(
          (instanceWrapperInstance) =>
            instanceWrapperInstance.constructor.name === MyZeebeC.name,
        ),
      ).toBeTruthy();
    });
  });
});
