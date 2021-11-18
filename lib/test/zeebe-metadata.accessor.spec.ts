import { Reflector } from '@nestjs/core';
import { Zeebe, ZeebeWorker } from '..';
import { ZeebeMetadataAccessor } from '../zeebe-metadata.accessor';

describe('ZeebeMetadataAccessor', () => {
  let metadataAccessor: ZeebeMetadataAccessor;
  beforeAll(() => {
    metadataAccessor = new ZeebeMetadataAccessor(new Reflector());
  });

  describe('isZeebeComponent', () => {
    it('should return true if the given class is a zeebe component', () => {
      @Zeebe()
      class MyZeebe {}
      expect(metadataAccessor.isZeebeComponent(MyZeebe)).toBe(true);
    });
    it('should return false if the given class is not zeebe component', () => {
      class TestClass {}
      expect(metadataAccessor.isZeebeComponent(TestClass)).toBe(false);
    });
  });

  describe('getZeebeComponentMetadata', () => {
    it('should return the given zeebe component metadata', () => {
      const opts = {};
      @Zeebe()
      class MyZeebe {
        processor() {}
      }
      expect(metadataAccessor.getZeebeComponentMetadata(MyZeebe)).toStrictEqual(
        opts,
      );
    });
  });

  describe('isZeebeWorker', () => {
    it('should return true if the given class property is a zeebe worker', () => {
      class MyZeebe {
        @ZeebeWorker()
        handleTask() {}
      }
      const myZeebeInstance = new MyZeebe();
      expect(metadataAccessor.isZeebeWorker(myZeebeInstance.handleTask)).toBe(
        true,
      );
    });
    it('should return false if the given class property is not a queue worker', () => {
      class MyZeebe {
        handleTask() {}
      }
      const myZeebeInstance = new MyZeebe();
      expect(metadataAccessor.isZeebeWorker(myZeebeInstance.handleTask)).toBe(
        false,
      );
    });
  });

  describe('getZeebeWorkerMetadata', () => {
    it('should return the given zeebe worker metadata', () => {
      const opts = { taskType: 'test-tasks', taskHandler: undefined };
      class MyZeebe {
        @ZeebeWorker(opts)
        handleTask() {}
      }
      const myZeebeInstance = new MyZeebe();
      expect(
        metadataAccessor.getZeebeWorkerMetadata(myZeebeInstance.handleTask),
      ).toBe(opts);
    });
  });
});
