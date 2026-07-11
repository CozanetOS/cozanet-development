import simpleGit, { SimpleGit } from 'simple-git';
import { GitStatus } from '../types';
import pino from 'pino';

const logger = pino({ name: 'git-engine' });

export class GitEngine {
  static readonly ENGINE_ID = 'dev:git';

  private getGit(repoPath: string): SimpleGit {
    return simpleGit(repoPath);
  }

  /**
   * Retrieves status of the git repo
   */
  async status(repoPath: string): Promise<GitStatus> {
    logger.info({ repoPath }, 'Retrieving git status');
    const git = this.getGit(repoPath);
    const statusResult = await git.status();

    return {
      branch: statusResult.current || 'detached HEAD',
      ahead: statusResult.ahead || 0,
      behind: statusResult.behind || 0,
      staged: statusResult.staged || [],
      unstaged: statusResult.files
        .filter(f => !statusResult.staged.includes(f.path) && f.working_dir !== '?')
        .map(f => f.path),
      untracked: statusResult.not_added || []
    };
  }

  /**
   * Commits staged changes or specific files
   */
  async commit(repoPath: string, message: string, files?: string[]): Promise<string> {
    logger.info({ repoPath, message }, 'Committing changes');
    const git = this.getGit(repoPath);

    if (files && files.length > 0) {
      await git.add(files);
    } else {
      await git.add('./*');
    }

    const commitResult = await git.commit(message);
    logger.info({ commitSha: commitResult.commit }, 'Commit successful');
    return commitResult.commit || 'no-commit';
  }

  /**
   * Pushes commits to remote
   */
  async push(repoPath: string, remote: string = 'origin', branch?: string): Promise<void> {
    logger.info({ repoPath, remote, branch }, 'Pushing changes');
    const git = this.getGit(repoPath);
    
    if (branch) {
      await git.push(remote, branch);
    } else {
      await git.push(remote);
    }
  }

  /**
   * Pulls latest changes from remote
   */
  async pull(repoPath: string): Promise<void> {
    logger.info({ repoPath }, 'Pulling latest changes');
    const git = this.getGit(repoPath);
    await git.pull();
  }

  /**
   * Clones a repository to target path
   */
  async clone(url: string, dest: string): Promise<void> {
    logger.info({ url, dest }, 'Cloning repository');
    await simpleGit().clone(url, dest);
  }

  /**
   * Creates a new branch
   */
  async createBranch(repoPath: string, name: string): Promise<void> {
    logger.info({ repoPath, branchName: name }, 'Creating new branch');
    const git = this.getGit(repoPath);
    await git.checkoutLocalBranch(name);
  }

  /**
   * Generates diff of unstaged and staged changes
   */
  async diff(repoPath: string): Promise<string> {
    logger.info({ repoPath }, 'Generating repository diff');
    const git = this.getGit(repoPath);
    return git.diff();
  }

  /**
   * Retrieves repository log
   */
  async log(repoPath: string, limit: number = 30): Promise<any[]> {
    logger.info({ repoPath, limit }, 'Retrieving logs');
    const git = this.getGit(repoPath);
    const logResult = await git.log({ maxCount: limit });
    return logResult.all;
  }
}
