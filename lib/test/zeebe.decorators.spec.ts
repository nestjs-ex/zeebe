import { JOB_ACTION_ACKNOWLEDGEMENT } from 'zeebe-node';
import {
  Zeebe,
  ZeebeWorker
} from '..';
import {
  ZEEBE_MODULE_ZEEBE,
  ZEEBE_MODULE_ZEEBE_WORKER
} from '../zeebe.constants';

describe('Decorators', () => {
  describe('@InjectQueue()', () => {
    it.todo('should enhance class with expected constructor params metadata');
  });

  describe('@Zeebe()', () => {
    it('should decorate the class with ZEEBE_MODULE_ZEEBE', () => {
      @Zeebe()
      class MyZeebe { }
      expect(Reflect.hasMetadata(ZEEBE_MODULE_ZEEBE, MyZeebe)).toEqual(true);
    });
    it('should define the ZEEBE_MODULE_ZEEBE metadata with the given options', () => {
      const opts = {};
      @Zeebe()
      class MyZeebe { }
      expect(Reflect.getMetadata(ZEEBE_MODULE_ZEEBE, MyZeebe)).toEqual(opts);
    });
  });

  describe('@ZeebeWorker()', () => {
    it('should decorate the method with ZEEBE_MODULE_ZEEBE_WORKER', () => {
      class MyZeebe {
        @ZeebeWorker()
        prop() { }
      }
      const myZeebeInstance = new MyZeebe();
      expect(
        Reflect.hasMetadata(ZEEBE_MODULE_ZEEBE_WORKER, myZeebeInstance.prop),
      ).toEqual(true);
    });
    it('should define the ZEEBE_MODULE_ZEEBE_WORKER metadata with the given options', () => {
      const opts = { taskType: 'test-task', taskHandler: () => { return JOB_ACTION_ACKNOWLEDGEMENT; } };
      class MyZeebe {
        @ZeebeWorker(opts)
        prop() { }
      }
      const myZeebeInstance = new MyZeebe();
      expect(
        Reflect.getMetadata(ZEEBE_MODULE_ZEEBE_WORKER, myZeebeInstance.prop),
      ).toEqual(opts);
    });
    it('should define the ZEEBE_MODULE_ZEEBE_WORKER metadata with the given options', () => {
      const opts = { taskType: 'test-task', taskHandler: undefined };
      class MyZeebe {
        @ZeebeWorker(opts.taskType)
        prop() { }
      }
      const myZeebeInstance = new MyZeebe();
      expect(
        Reflect.getMetadata(ZEEBE_MODULE_ZEEBE_WORKER, myZeebeInstance.prop),
      ).toStrictEqual(opts);
    });
  });
});
