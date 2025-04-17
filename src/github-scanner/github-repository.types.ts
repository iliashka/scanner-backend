export type GithubRepository = {
  name: string;
  size: number;
  owner: GithubRepositoryOwner;
  default_branch: string;
  private: boolean;
};

export type GithubRepositoryOwner = {
  login: string;
};

export type GithubRepositoryTreeResponse = {
  tree: GithubRepositoryTree[];
};

export type GithubRepositoryTree = {
  path: string;
  type: string;
};

export type GithubRepositoryFileContent = {
  content: string;
};

export type GithubRepositoryHook = {
  active: boolean;
};

export type ScanReposDto = {
  token: string;
  user_name: string;
  repo_names: string[];
};

export type GithubRepositoryDetails = {
  name: string;
  size: number;
  owner: string;
  private: boolean;
  filesCount: number;
  ymlContent: string | null;
  activeHooks: GithubRepositoryHook[];
};

export type GithubRepositoryListItem = Pick<
  GithubRepositoryDetails,
  'name' | 'size' | 'owner'
>;
