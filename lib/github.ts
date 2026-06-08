export interface RepoInfo {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  topics: string[];
  defaultBranch: string;
  updatedAt: string;
  openIssues: number;
  license: string | null;
}

export interface FileNode {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

export interface RepoData {
  info: RepoInfo;
  tree: FileNode[];
  readme: string;
  keyFiles: Record<string, string>; // path -> content
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const cleaned = url.trim().replace(/\.git$/, "");
  const match = cleaned.match(/github\.com[/:]([\w.-]+)\/([\w.-]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

async function fetchGitHub(path: string, token?: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub API error ${res.status}: ${path}`);
  return res.json();
}

// Key files to fetch content for analysis
const KEY_FILE_PATTERNS = [
  /^readme\.md$/i,
  /^package\.json$/,
  /^pyproject\.toml$/,
  /^setup\.py$/,
  /^requirements\.txt$/,
  /^cargo\.toml$/i,
  /^go\.mod$/,
  /^docker-?compose\.ya?ml$/i,
  /^dockerfile$/i,
  /^main\.(py|ts|js|go|rs)$/,
  /^index\.(py|ts|js)$/,
  /^app\.(py|ts|js)$/,
  /^architecture\.(md|txt)$/i,
  /^docs\/architecture\.(md|txt)$/i,
];

function isKeyFile(path: string): boolean {
  const filename = path.split("/").pop() || "";
  return KEY_FILE_PATTERNS.some((p) => p.test(filename) || p.test(path));
}

export async function fetchRepoData(url: string, token?: string): Promise<RepoData> {
  const parsed = parseGitHubUrl(url);
  if (!parsed) throw new Error("올바른 GitHub URL을 입력해주세요");

  const { owner, repo } = parsed;

  // Fetch basic repo info
  const repoJson = await fetchGitHub(`/repos/${owner}/${repo}`, token);

  const info: RepoInfo = {
    name: repoJson.name,
    fullName: repoJson.full_name,
    description: repoJson.description || "",
    stars: repoJson.stargazers_count,
    forks: repoJson.forks_count,
    language: repoJson.language || "Unknown",
    topics: repoJson.topics || [],
    defaultBranch: repoJson.default_branch,
    updatedAt: repoJson.updated_at,
    openIssues: repoJson.open_issues_count,
    license: repoJson.license?.name || null,
  };

  // Fetch file tree (recursive)
  const treeJson = await fetchGitHub(
    `/repos/${owner}/${repo}/git/trees/${info.defaultBranch}?recursive=1`,
    token
  );

  const tree: FileNode[] = (treeJson.tree || [])
    .filter((f: FileNode) => f.type === "blob" && !f.path.includes("node_modules"))
    .slice(0, 500); // cap to avoid huge repos

  // Fetch README
  let readme = "";
  try {
    const readmeJson = await fetchGitHub(`/repos/${owner}/${repo}/readme`, token);
    readme = Buffer.from(readmeJson.content, "base64").toString("utf-8").slice(0, 8000);
  } catch {}

  // Fetch key file contents
  const keyFiles: Record<string, string> = {};
  const keyFilePaths = tree.filter((f) => isKeyFile(f.path)).slice(0, 8);

  await Promise.allSettled(
    keyFilePaths.map(async (f) => {
      try {
        const fileJson = await fetchGitHub(
          `/repos/${owner}/${repo}/contents/${f.path}`,
          token
        );
        if (fileJson.content) {
          keyFiles[f.path] = Buffer.from(fileJson.content, "base64")
            .toString("utf-8")
            .slice(0, 3000);
        }
      } catch {}
    })
  );

  return { info, tree, readme, keyFiles };
}
