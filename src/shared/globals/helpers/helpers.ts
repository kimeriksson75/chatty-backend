export class Helpers {
  static firstLetterUppercase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static generateRandomIntegers(integerLength: number): number {
    let result = '';
    for (let i = 0; i < integerLength; i++) {
      result += Math.floor(Math.random() * (10 - 0)) + 0;
    }
    return parseInt(result, 10);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static parseJson(prop: string): any {
    try {
      JSON.parse(prop);
    } catch (error) {
      return prop;
    }
  }
}
