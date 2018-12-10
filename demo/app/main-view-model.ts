import { Observable } from 'tns-core-modules/data/observable';
import { Tglib } from 'nativescript-tglib';

export class HelloWorldModel extends Observable {
  public message: string;
  private tglib: Tglib;

  constructor() {
    super();

    this.tglib = new Tglib();
    this.message = this.tglib.message;
  }
}
