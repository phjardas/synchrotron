import { Pluggable } from "./model";


export class Registry<T extends Pluggable> {
  private instances: { [key: string]: T } = {};

  register(instance: T) {
    const { id } = instance;

    if (id in this.instances) {
      throw new Error(`An instance with the ID ${id} already exists`);
    }

    this.instances[id] = instance;
  }

  get(id: string): T {
    if (!(id in this.instances)) {
      throw new Error(`No instance found with the ID ${id}`);
    }

    return this.instances[id];
  }
}
