export abstract class BaseConfBuilder {
  lines: string[] = [];

  constructor() {}

  private addLine(line: string): BaseConfBuilder {
    this.lines.push(line);
    return this;
  }

  section(title: string): BaseConfBuilder {
    return this.addLine(`[${title}]`);
  }

  variable(name: string, value: string | string[]): BaseConfBuilder {
    if (value instanceof Array) {
      for (const v of value) {
        this.variable(name, v);
      }
      return this;
    }
    return this.addLine(`${name} = ${value}`);
  }

  build(): string {
    return this.lines.join('\n');
  }
}
