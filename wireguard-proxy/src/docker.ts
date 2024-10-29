import * as fs from 'fs';

export function isRunningInDocker() {
  return fs.existsSync('/.dockerenv');
}
