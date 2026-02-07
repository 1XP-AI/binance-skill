import { describe, it, expect } from 'vitest';
import { spawn } from 'child_process';
import { join } from 'path';

const CLI_PATH = join(__dirname, '../../dist/cli.js');

function runCLI(args: string[]): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    const proc = spawn('node', [CLI_PATH, ...args], {
      env: {
        ...process.env,
        HOME: '/tmp/binance-test'
      }
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      resolve({ stdout, stderr, code: code ?? 0 });
    });
  });
}

describe('CLI', () => {
  describe('help', () => {
    it('should show help message', async () => {
      const { stdout, code } = await runCLI(['help']);
      expect(code).toBe(0);
      expect(stdout).toContain('binance-skill CLI');
      expect(stdout).toContain('Spot');
    });

    it('should show help by default', async () => {
      const { stdout, code } = await runCLI([]);
      expect(code).toBe(0);
      expect(stdout).toContain('binance-skill CLI');
    });
  });

  describe('spot commands', () => {
    it('should require symbol for orderbook', async () => {
      const { stderr, code } = await runCLI(['orderbook']);
      expect(code).toBe(1);
      expect(stderr).toContain('Symbol required');
    });

    it('should require symbol and interval for klines', async () => {
      const { stderr, code } = await runCLI(['klines']);
      expect(code).toBe(1);
      expect(stderr).toContain('Symbol and interval required');
    });
  });

  describe('futures commands', () => {
    it('should require symbol for futures-orderbook', async () => {
      const { stderr, code } = await runCLI(['futures-orderbook']);
      expect(code).toBe(1);
      expect(stderr).toContain('Symbol required');
    });
  });
});
