import { Injectable } from '@nestjs/common';

@Injectable()
export class GithubScannerService {
  private async fetchWithToken(url: string, token: string, options: any = {}) {
    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(
        `Fetch failed: ${res.status} ${res.statusText} - ${error}`,
      );
    }

    return res.json();
  }

  async getRepos(token: string, username: string): Promise<any[]> {
    const allRepos: any[] = [];

    const data = await this.fetchWithToken(
      `https://api.github.com/users/${username}/repos`,
      token,
    );

    data.forEach((repo) => {
      allRepos.push({
        name: repo.name,
        size: repo.size,
        owner: repo.owner.login,
      });
    });

    return allRepos;
  }

  async getRepoDetails(token: string, owner: string, repo: string) {
    const repoData = await this.fetchWithToken(
      `https://api.github.com/repos/${owner}/${repo}`,
      token,
    );

    const branch = repoData.default_branch;

    const treeData = await this.fetchWithToken(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      token,
    );

    const files = treeData.tree?.filter((item) => item.type === 'blob') || [];
    const filesCount = files.length;

    const ymlFile = files.find(
      (f) => f.path.endsWith('.yml') || f.path.endsWith('.yaml'),
    );
    let ymlContent: string | null = null;

    if (ymlFile) {
      const contentData = await this.fetchWithToken(
        `https://api.github.com/repos/${owner}/${repo}/contents/${ymlFile.path}`,
        token,
      );
      const buffer = Buffer.from(contentData.content, 'base64');
      ymlContent = buffer.toString('utf-8');
    }

    const hooks = await this.fetchWithToken(
      `https://api.github.com/repos/${owner}/${repo}/hooks`,
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
  }

  async scanReposInParallel(
    token: string,
    repoInfos: { owner: string; repo: string }[],
  ) {
    const limit = 2;
    const results = [];
    let i = 0;

    while (i < repoInfos.length) {
      const batch = repoInfos.slice(i, i + limit);
      const promises = batch.map(({ owner, repo }) =>
        this.getRepoDetails(token, owner, repo),
      );
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
      i += limit;
    }

    return results;
  }
}
