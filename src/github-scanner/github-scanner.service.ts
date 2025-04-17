import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  GithubRepository,
  GithubRepositoryDetails,
  GithubRepositoryFileContent,
  GithubRepositoryHook,
  GithubRepositoryListItem,
  GithubRepositoryTreeResponse,
  ScanReposDto,
} from './github-repository.types';

@Injectable()
export class GithubScannerService {
  private async _doFetch<T>(url: string, token: string): Promise<T> {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(
        `Fetch failed: ${res.status} ${res.statusText} - ${error}`,
      );
    }

    return res.json() as Promise<T>;
  }

  private async _getRepoDetails(
    token: string,
    user_name: string,
    repo: string,
  ): Promise<GithubRepositoryDetails> {
    try {
      const repoData = await this._doFetch<GithubRepository>(
        `https://api.github.com/repos/${user_name}/${repo}`,
        token,
      );

      const branch = repoData.default_branch;

      const treeData = await this._doFetch<GithubRepositoryTreeResponse>(
        `https://api.github.com/repos/${user_name}/${repo}/git/trees/${branch}?recursive=1`,
        token,
      );

      const files = treeData.tree?.filter((item) => item.type === 'blob') || [];
      const filesCount = files.length;

      const ymlFile = files.find(
        (f) => f.path.endsWith('.yml') || f.path.endsWith('.yaml'),
      );
      let ymlContent: string | null = null;

      if (ymlFile) {
        const fileContentData =
          await this._doFetch<GithubRepositoryFileContent>(
            `https://api.github.com/repos/${user_name}/${repo}/contents/${ymlFile.path}`,
            token,
          );
        const buffer = Buffer.from(fileContentData.content, 'base64');
        ymlContent = buffer.toString('utf-8');
      }

      const hooks = await this._doFetch<GithubRepositoryHook[]>(
        `https://api.github.com/repos/${user_name}/${repo}/hooks`,
        token,
      );
      const activeHooks = hooks.filter((h) => h.active);

      return {
        name: repoData.name,
        size: repoData.size,
        owner: repoData.owner.login,
        private: repoData.private,
        filesCount,
        ymlContent,
        activeHooks,
      };
    } catch (err) {
      console.error(`Error in getRepoDetails for repo: ${repo}:`, err);
      throw new InternalServerErrorException('Failed to fetch repo details.');
    }
  }

  async getRepos(
    token: string,
    user_name: string,
  ): Promise<GithubRepositoryListItem[]> {
    try {
      const data = await this._doFetch<GithubRepository[]>(
        `https://api.github.com/users/${user_name}/repos`,
        token,
      );

      return data.map((repo) => ({
        name: repo.name,
        size: repo.size,
        owner: repo.owner.login,
      }));
    } catch (err) {
      console.error(`Error in getRepos for user ${user_name}:`, err);
      throw new InternalServerErrorException('Failed to fetch repositories.');
    }
  }

  async scanReposInParallel(
    dto: ScanReposDto,
  ): Promise<GithubRepositoryDetails[]> {
    const { repo_names, user_name, token } = dto;
    const limit = 2;
    const results: GithubRepositoryDetails[] = [];
    let i = 0;

    try {
      while (i < repo_names.length) {
        const batch = repo_names.slice(i, i + limit);
        const promises = batch.map((repo) =>
          this._getRepoDetails(token, user_name, repo),
        );
        const batchResults = await Promise.all(promises);
        results.push(...batchResults);
        i += limit;
      }

      return results;
    } catch (err) {
      console.error('Error in scanReposInParallel:', err);
      throw new InternalServerErrorException('Failed to scan repositories.');
    }
  }
}
