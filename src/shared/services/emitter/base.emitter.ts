import Logger from 'bunyan';
import { config } from '@root/config';
import EventEmitter from 'events';

export abstract class BaseEmitter {
  log: Logger;
  client: string;
  eventEmitter: EventEmitter;

  constructor(name: string) {
    this.client = name;
    this.log = config.createLogger(this.client);
    this.eventEmitter = new EventEmitter();
  }
}
