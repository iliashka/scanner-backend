export class GithubRepository {
  name: string;
  size: string;
  owner: GithubRepositoryOwner;
  default_branch: string;
  private: boolean;
}

export class GithubRepositoryOwner {
  login: string;
}

export class GithubRepositoryTreeResponse {
  tree: GithubRepositoryTree[];
}

export class GithubRepositoryTree {
  path: string;
  type: string;
}

export class GithubRepositoryFileContent {
  content: string;
}

export class GithubRepositoryHook {
  active: boolean;
}
