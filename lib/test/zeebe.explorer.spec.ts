import { Test, TestingModule } from '@nestjs/testing';
import { ZeebeExplorer } from '../zeebe.explorer';
import { ZeebeModule } from '../zeebe.module';

describe('ZeebeExplorer', () => {
  let zeebeExplorer: ZeebeExplorer;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ZeebeModule.register({ hostname: 'localhost', port: '26500' }),
      ],
    }).compile();

    zeebeExplorer = moduleRef.get(ZeebeExplorer);
  });
  afterAll(async () => {
    await moduleRef.close();
  });
  describe('handleZeebeWorker', () => {
    it('should add the given function to the zeebe worker handlers with options', () => {
      const instance = { handler: jest.fn() };
      const zbClient = { createWorker: jest.fn() } as any;
      const opts = { taskType: 'test-task', taskHandler: jest.fn() };
      zeebeExplorer.handleZeebeWorker(
        instance,
        'handler',
        zbClient,
        null,
        false,
        opts,
      );
      expect(zbClient.createWorker).toHaveBeenCalledWith(opts);
    });
  });
});