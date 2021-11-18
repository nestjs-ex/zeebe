import { SetMetadata } from '@nestjs/common';
import { ICustomHeaders, IInputVariables, IOutputVariables, ZBWorkerConfig } from 'zeebe-node/interfaces';
import { ZEEBE_MODULE_ZEEBE_WORKER } from '../zeebe.constants';

export interface ZeebeWorkerOptions<
  WorkerInputVariables = IInputVariables,
  CustomHeaderShape = ICustomHeaders,
  WorkerOutputVariables = IOutputVariables
  > extends ZBWorkerConfig<WorkerInputVariables, CustomHeaderShape, WorkerOutputVariables> {
}

export function ZeebeWorker(): MethodDecorator;
export function ZeebeWorker(taskType: string): MethodDecorator;
export function ZeebeWorker<
  WorkerInputVariables = IInputVariables,
  CustomHeaderShape = ICustomHeaders,
  WorkerOutputVariables = IOutputVariables
>(options: ZeebeWorkerOptions<WorkerInputVariables, CustomHeaderShape, WorkerOutputVariables>): MethodDecorator;
export function ZeebeWorker<
  WorkerInputVariables = IInputVariables,
  CustomHeaderShape = ICustomHeaders,
  WorkerOutputVariables = IOutputVariables
>(
  taskTypeOrOptions?: string | ZeebeWorkerOptions<WorkerInputVariables, CustomHeaderShape, WorkerOutputVariables>,
): MethodDecorator {
  const options: ZeebeWorkerOptions<WorkerInputVariables, CustomHeaderShape, WorkerOutputVariables> = typeof taskTypeOrOptions === 'string'
    ? { taskType: taskTypeOrOptions, taskHandler: undefined }
    : taskTypeOrOptions;
  return SetMetadata(ZEEBE_MODULE_ZEEBE_WORKER, options || {});
}
