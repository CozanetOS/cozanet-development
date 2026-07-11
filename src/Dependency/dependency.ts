import execa from 'execa';
import pino from 'pino';

const logger = pino({ name: 'dependency-engine' });

export class DependencyEngine {
  static readonly ENGINE_ID = 'dev:dependency';

  /**
   * Audits packages inside target directory
   */
  async audit(projectDir: string): Promise<any> {
    logger.info({ projectDir }, 'Running security package audits');
    try {
      const { stdout } = await execa('npm', ['audit', '--json'], { cwd: projectDir });
      return JSON.parse(stdout);
    } catch (err: any) {
      // npm audit exits with non-zero if vulnerabilities are found
      try {
        if (err.stdout) {
          return JSON.parse(err.stdout);
        }
      } catch (parseErr) {
        logger.error('Failed to parse npm audit output json', parseErr);
      }
      return { error: 'Failed to run audit successfully', details: err.message };
    }
  }

  /**
   * Installs or updates dependencies
   */
  async update(projectDir: string, packages?: string[]): Promise<string> {
    logger.info({ projectDir, packages }, 'Updating packages');
    const args = packages && packages.length > 0 ? ['install', ...packages] : ['update'];
    
    try {
      const { stdout, stderr } = await execa('npm', args, { cwd: projectDir });
      return stdout + '\n' + stderr;
    } catch (err: any) {
      logger.error('Failed to update dependencies', err);
      return err.stdout + '\n' + err.stderr + '\n' + err.message;
    }
  }

  /**
   * Analyzes dependencies structure from package.json content
   */
  async analyze(packageJson: string): Promise<any> {
    logger.info('Analyzing package.json dependencies');
    try {
      const parsed = JSON.parse(packageJson);
      return {
        name: parsed.name,
        dependenciesCount: Object.keys(parsed.dependencies || {}).length,
        devDependenciesCount: Object.keys(parsed.devDependencies || {}).length,
        dependenciesList: Object.keys(parsed.dependencies || {}),
        devDependenciesList: Object.keys(parsed.devDependencies || {})
      };
    } catch (err: any) {
      logger.error('Invalid package.json file format provided', err);
      return { error: 'Invalid packageJson content', message: err.message };
    }
  }

  /**
   * Checks for outdated packages inside the project
   */
  async checkOutdated(projectDir: string): Promise<any> {
    logger.info({ projectDir }, 'Checking outdated packages');
    try {
      const { stdout } = await execa('npm', ['outdated', '--json'], { cwd: projectDir });
      return JSON.parse(stdout);
    } catch (err: any) {
      // npm outdated exits with 1 if there are outdated packages
      try {
        if (err.stdout) {
          return JSON.parse(err.stdout);
        }
      } catch (parseErr) {
        logger.error('Failed to parse outdated output', parseErr);
      }
      return { message: 'No outdated packages found or execution failed', details: err.message };
    }
  }
}
