import { Node } from './node';

export class Tree<T> {
  nodes = new Map<string, Node<T>>();

  constructor() {
    this.nodes.set('root', new Node<T>('root'));
  }

  get(id: string): Node<T> | undefined {
    return this.nodes.get(id);
  }

  addNode(targetId: string, parentId: string, description: T) {
    const newNode = new Node<T>(targetId, parentId, description);

    const parentNode = this.nodes.get(parentId);
    if (!parentNode) return;

    parentNode.children.push(targetId);
    this.nodes.set(targetId, newNode);
  }

  attachNode(targetId: string, parentId: string) {
    const targetNode = this.nodes.get(targetId);
    if (!targetNode) return;

    const parentNode = this.nodes.get(parentId);
    if (!parentNode) return;

    parentNode.children.push(targetId);
    targetNode.parentId = parentId;
  }

  removeNode(targetId: string): Node<T> | undefined {
    const targetNode = this.nodes.get(targetId);
    if (!targetNode) return;

    const parentNode = this.nodes.get(targetNode.parentId);
    if (!parentNode) return;

    const targetIndex = parentNode.children.indexOf(targetId);
    if (targetIndex !== -1) parentNode.children.splice(targetIndex, 1);
    targetNode.parentId = '0';

    return this.nodes.get(targetId);
  }

  updateNode(targetId: string, description: T) {
    const targetNode = this.nodes.get(targetId);
    if (!targetNode) return;

    targetNode.description = description;
  }

  toJSON() {
    return { nodes: Array.from(this.nodes.values()) };
  }

  isAncestor(targetId: string, ancestorId: string) {
    let curNode = this.nodes.get(targetId);
    while (curNode) {
      if (curNode.parentId === ancestorId) return true;
      curNode = this.nodes.get(curNode.parentId);
    }
    return false;
  }

  static parse<T>(json: string) {
    const { nodes } = JSON.parse(json);
    const tree = new Tree<T>();
    tree.nodes = new Map<string, Node<T>>();
    nodes.forEach((nodeJson) => {
      const node = Node.parse<T>(JSON.stringify(nodeJson));
      tree.nodes.set(node.targetId, node);
    });
    return tree;
  }
}
