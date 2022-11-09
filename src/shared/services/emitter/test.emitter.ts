import { BaseEmitter } from './base.emitter';

class TestEmitter extends BaseEmitter {
  constructor() {
    super('testEmitter');
  }
  private async waitForEmitter(): Promise<void> {
    return new Promise((resolve) => {
      this.eventEmitter.once('data', resolve);
    });
  }
  public async runTest(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await this.waitForEmitter();

    setTimeout(() => this.eventEmitter.emit('data', { message: 'hello dolly' }));

    this.log.info(`Data recieved ${JSON.stringify(data)}`);
  }
}

export const testEmitter: TestEmitter = new TestEmitter();
