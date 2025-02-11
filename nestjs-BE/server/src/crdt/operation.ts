import { Clock } from './clock';
import { Node } from './node';
import { Tree } from './tree';

export interface OperationLog<T> {
  operation: Operation<T>;
  oldParentId?: string;
  oldDescription?: T | null;
}

export interface OperationInput {
  id: string;
  clock: Clock;
}

export interface OperationAddInput<T> extends OperationInput {
  description: T;
  parentId: string;
}

export interface OperationMoveInput extends OperationInput {
  parentId: string;
}

export interface OperationUpdateInput<T> extends OperationInput {
  description: T;
}

interface ClockInterface {
  id: string;
  counter: number;
}

export interface SerializedOperation<T> {
  operationType: string;
  id: string;
  clock: ClockInterface;
  description?: T;
  parentId?: string;
}

export abstract class Operation<T> {
  operationType: string;
  id: string;
  clock: Clock;

  constructor(operationType: string, id: string, clock: Clock) {
    this.operationType = operationType;
    this.id = id;
    this.clock = clock;
  }

  abstract doOperation(tree: Tree<T>): OperationLog<T>;
  abstract undoOperation(tree: Tree<T>, log: OperationLog<T>): void;
  abstract redoOperation(tree: Tree<T>, log: OperationLog<T>): OperationLog<T>;
}

export class OperationAdd<T> extends Operation<T> {
  description: T;
  parentId: string;

  constructor(input: OperationAddInput<T>) {
    super('add', input.id, input.clock);
    this.description = input.description;
    this.parentId = input.parentId;
  }

  doOperation(tree: Tree<T>): OperationLog<T> {
    tree.addNode(this.id, this.parentId, this.description);
    return { operation: this };
  }

  undoOperation(tree: Tree<T>, log: OperationLog<T>): void {
    tree.removeNode(log.operation.id);
  }

  redoOperation(tree: Tree<T>, log: OperationLog<T>): OperationLog<T> {
    tree.attachNode(log.operation.id, this.parentId);
    return { operation: this };
  }

  static parse<T>(
    serializedOperation: SerializedOperation<T>,
  ): OperationAdd<T> {
    const input: OperationAddInput<T> = {
      id: serializedOperation.id,
      parentId: serializedOperation.parentId as string,
      description: serializedOperation.description as T,
      clock: new Clock(
        serializedOperation.clock.id,
        serializedOperation.clock.counter,
      ),
    };
    return new OperationAdd<T>(input);
  }
}

export class OperationDelete<T> extends Operation<T> {
  constructor(input: OperationInput) {
    super('delete', input.id, input.clock);
  }

  doOperation(tree: Tree<T>): OperationLog<T> {
    const node = tree.get(this.id) as Node<T>;
    const oldParentId = node.parentId;
    tree.removeNode(this.id);
    return { operation: this, oldParentId: oldParentId };
  }

  undoOperation(tree: Tree<T>, log: OperationLog<T>): void {
    tree.attachNode(log.operation.id, log.oldParentId as string);
  }

  redoOperation(tree: Tree<T>, log: OperationLog<T>): OperationLog<T> {
    const redoLog = log.operation.doOperation(tree);
    return redoLog;
  }

  static parse<T>(
    serializedOperation: SerializedOperation<T>,
  ): OperationDelete<T> {
    const input: OperationInput = {
      id: serializedOperation.id,
      clock: new Clock(
        serializedOperation.clock.id,
        serializedOperation.clock.counter,
      ),
    };
    return new OperationDelete<T>(input);
  }
}

export class OperationMove<T> extends Operation<T> {
  parentId: string;

  constructor(input: OperationMoveInput) {
    super('move', input.id, input.clock);
    this.parentId = input.parentId;
  }

  doOperation(tree: Tree<T>): OperationLog<T> {
    const node = tree.get(this.id) as Node<T>;
    const oldParentId = node.parentId;

    if (tree.isAncestor(this.parentId, this.id)) {
      return { operation: this, oldParentId };
    }

    tree.removeNode(this.id);
    tree.attachNode(this.id, this.parentId);
    return { operation: this, oldParentId };
  }

  undoOperation(tree: Tree<T>, log: OperationLog<T>): void {
    tree.removeNode(log.operation.id);
    tree.attachNode(log.operation.id, log.oldParentId as string);
  }

  redoOperation(tree: Tree<T>, log: OperationLog<T>): OperationLog<T> {
    const redoLog = log.operation.doOperation(tree);
    return redoLog;
  }

  static parse<T>(
    serializedOperation: SerializedOperation<T>,
  ): OperationMove<T> {
    const input: OperationMoveInput = {
      id: serializedOperation.id,
      parentId: serializedOperation.parentId as string,
      clock: new Clock(
        serializedOperation.clock.id,
        serializedOperation.clock.counter,
      ),
    };
    return new OperationMove<T>(input);
  }
}

export class OperationUpdate<T> extends Operation<T> {
  description: T;

  constructor(input: OperationUpdateInput<T>) {
    super('update', input.id, input.clock);
    this.description = input.description;
  }

  doOperation(tree: Tree<T>): OperationLog<T> {
    const node = tree.get(this.id) as Node<T>;
    const oldDescription = node.description;
    tree.updateNode(this.id, this.description);
    return { operation: this, oldDescription: oldDescription };
  }

  undoOperation(tree: Tree<T>, log: OperationLog<T>): void {
    tree.updateNode(log.operation.id, log.oldDescription as T);
  }

  redoOperation(tree: Tree<T>, log: OperationLog<T>): OperationLog<T> {
    const redoLog = log.operation.doOperation(tree);
    return redoLog;
  }

  static parse<T>(
    serializedOperation: SerializedOperation<T>,
  ): OperationUpdate<T> {
    const input: OperationUpdateInput<T> = {
      id: serializedOperation.id,
      description: serializedOperation.description as T,
      clock: new Clock(
        serializedOperation.clock.id,
        serializedOperation.clock.counter,
      ),
    };
    return new OperationUpdate<T>(input);
  }
}
