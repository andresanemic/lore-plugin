import { execFileSync } from "node:child_process";

export function readGitSource({ root, commit, name, exec = execFileSync }) {
  const exactRoot = root.replaceAll("\\", "/");
  try {
    return exec("git", ["-c", `safe.directory=${exactRoot}`, "show", `${commit}:src/${name}`], { cwd: root });
  } catch (error) {
    const detail = String(error.stderr ?? error.message);
    if (/dubious ownership/i.test(detail)) {
      throw new Error(`Git could not verify the Vespi source repository at ${exactRoot} because of dubious ownership; verification is scoped to that exact directory.`, { cause: error });
    }
    throw error;
  }
}
