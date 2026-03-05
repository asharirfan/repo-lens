import pc from 'picocolors';

export type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug';

let silent = false;
let verbose = false;

export function setSilent(value: boolean): void {
  silent = value;
}

export function setVerbose(value: boolean): void {
  verbose = value;
}

export const logger = {
  info(message: string): void {
    if (!silent) {
      console.log(pc.cyan('ℹ'), message);
    }
  },

  success(message: string): void {
    if (!silent) {
      console.log(pc.green('✓'), message);
    }
  },

  warn(message: string): void {
    if (!silent) {
      console.warn(pc.yellow('⚠'), pc.yellow(message));
    }
  },

  error(message: string): void {
    console.error(pc.red('✗'), pc.red(message));
  },

  debug(message: string): void {
    if (!silent && verbose) {
      console.log(pc.gray('·'), pc.gray(message));
    }
  },

  blank(): void {
    if (!silent) {
      console.log();
    }
  },
};
