import { Arguments } from "yargs";
import { Engine } from "./model";

export interface Plugin {
  readonly id: string;
  readonly version: string;
  readonly name: string;
  readonly description: string;
  readonly author: string;
  readonly extensions: Extension[] | Promise<Extension[]>;
}

export interface Extension {
  readonly type: string;
  readonly id: string;
  addCommandLineOptions(yargs: Arguments): Arguments;
  extend(engine: Engine, args: any): Engine;
}
