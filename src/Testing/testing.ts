import execa from 'execa';
import groqClient from '../groq-client';
import { TestResult } from '../types';
import pino from 'pino';

const logger = pino({ name: 'testing-engine' });

export class TestingEngine {
  static readonly ENGINE_ID = 'dev:testing';

  /**
   * Executes test suites under project directory
   */
  async runTests(projectDir: string, runner: 'jest' | 'vitest' | 'mocha' = 'jest'): Promise<TestResult> {
    logger.info({ projectDir, runner }, 'Running tests');

    try {
      const { stdout, stderr } = await execa(runner, [], { cwd: projectDir, preferLocal: true });
      const output = stdout + '\n' + stderr;

      // Extract details if possible, or build basic success payload
      return {
        passed: 1, // Mocked / aggregated counts or parsing would go here in actual systems
        failed: 0,
        skipped: 0,
        output,
        success: true
      };
    } catch (err: any) {
      logger.error('Tests execution failed', err);
      return {
        passed: 0,
        failed: 1,
        skipped: 0,
        output: err.stdout + '\n' + err.stderr + '\n' + err.message,
        success: false
      };
    }
  }

  /**
   * Generates a fully fleshed out test file for a piece of code
   */
  async generateTests(code: string, language: string): Promise<string> {
    logger.info({ language }, 'Generating test suites');
    const systemPrompt = `You are an expert software developer and quality assurance engineer. Write comprehensive and high-coverage unit tests for the given code.
Ensure you use standard frameworks (e.g., Jest/Mocha for JS/TS, pytest for Python, cargo test for Rust, go test for Go). Output ONLY the test code without markdown unless requested.`;

    const response = await groqClient.createChatCompletion({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Language: ${language}\nCode to test:\n${code}` }
      ],
      temperature: 0.2,
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Runs linter inside project directory
   */
  async runLint(projectDir: string): Promise<{ errors: number; warnings: number; output: string }> {
    logger.info({ projectDir }, 'Running lint tasks');
    try {
      const { stdout, stderr } = await execa('npm', ['run', 'lint'], { cwd: projectDir });
      const output = stdout + '\n' + stderr;
      return { errors: 0, warnings: 0, output };
    } catch (err: any) {
      logger.warn('Lint completed with issues or script failed');
      const output = err.stdout + '\n' + err.stderr + '\n' + err.message;
      return {
        errors: 1, // general estimation
        warnings: 0,
        output
      };
    }
  }

  /**
   * Runs TypeScript compiler typecheck checks
   */
  async runTypecheck(projectDir: string): Promise<{ errors: number; output: string }> {
    logger.info({ projectDir }, 'Running typecheck tasks');
    try {
      const { stdout, stderr } = await execa('npx', ['tsc', '--noEmit'], { cwd: projectDir });
      const output = stdout + '\n' + stderr;
      return { errors: 0, output };
    } catch (err: any) {
      logger.warn('Typecheck found errors');
      const output = err.stdout + '\n' + err.stderr + '\n' + err.message;
      return {
        errors: 1,
        output
      };
    }
  }
}
