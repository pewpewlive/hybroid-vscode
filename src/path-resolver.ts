import { existsSync } from "fs"
import { isAbsolute, join, resolve } from "path"

// DEV_FALLBACK_PATHS holds a hardcoded path to a locally-built
// binary for development. It's intentionally platform-specific:
// on macOS/Linux we expect the binary to be on PATH or in
// ~/.hybroid, so no fallback is needed. On Windows, where
// neither is reliably true, contributors can set this to their
// own checkout path.
//
// This list lives alongside the resolver (rather than in
// extension.ts) so the resolver is fully unit-testable from a
// plain `bun test` invocation, without needing the VS Code
// runtime to be present.
const DEV_FALLBACK_PATHS: Record<string, string> = {
  win32: "C:\\Users\\Dominykas\\Documents\\Development\\hybroid\\build\\hybroid-windows-x86_64.exe",
}

// findBinaryInHome returns the absolute path of `name` if it
// exists in one of the well-known install locations under `home`,
// or undefined otherwise. The order is:
//
//   1. ~/.hybroid/<name>            — the documented install location
//   2. ~/.local/bin/<name>          — XDG user bin
//   3. ~/.local/share/hybroid/bin/  — XDG data dir
//   4. /usr/local/bin/<name>        — system-wide Unix install
//   5. /opt/homebrew/bin/<name>     — Homebrew on Apple Silicon
//
// The order matches the convention: documented install location
// first, XDG second, system fallbacks last.
export function findBinaryInHome(name: string, home: string): string | undefined {
  const candidates = [
    join(home, ".hybroid", name),
    join(home, ".local", "bin", name),
    join(home, ".local", "share", "hybroid", "bin", name),
    join("/usr/local/bin", name),
    join("/opt/homebrew/bin", name),
  ]
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate
    }
  }
  return undefined
}

// findBinaryInPath returns the absolute path of `name` if it
// appears in any directory listed in `pathEnv`, or undefined
// otherwise. The PATH separator is `;` on Windows and `:` on
// Unix (matching Go's PATH-walking convention in os/exec.LookPath).
//
// Empty entries (e.g. "::" on Unix or ";;" on Windows) are
// skipped. Relative entries are resolved against the current
// working directory so the returned path is always absolute
// (matches the os/exec.LookPath contract).
//
// VS Code on macOS is launched with a sanitized PATH that does
// not include shell-managed entries like ~/.hybroid. A bare-name
// spawn would fail with ENOENT even when the shell can run the
// command. The explicit walk below is the workaround: it makes
// the search visible and testable, instead of relying on the
// runtime's PATH inheritance.
export function findBinaryInPath(name: string, pathEnv: string): string | undefined {
  const sep = process.platform === "win32" ? ";" : ":"
  for (const dir of pathEnv.split(sep)) {
    if (!dir) {
      continue
    }
    const candidate = isAbsolute(dir) ? join(dir, name) : resolve(dir, name)
    if (existsSync(candidate)) {
      return candidate
    }
  }
  return undefined
}

// resolveLanguageServerPath picks the absolute path the
// extension should spawn for the Hybroid language server. The
// order of precedence is:
//
//   1. configOverride (the `hybroid.languageServerPath` user
//      setting) — explicit user choice always wins.
//   2. findBinaryInPath — an explicit PATH walk. Catches
//      installs from Homebrew, Scoop, apt, brew, etc.
//   3. findBinaryInHome — the documented ~/.hybroid/ location
//      and other well-known dirs.
//   4. DEV_FALLBACK_PATHS[platform] — for local development on
//      Windows, where neither PATH nor ~/.hybroid is reliable.
//   5. The bare `exeName` — last-resort spawn. The OS will
//      re-walk PATH for us; this is the legacy behavior kept
//      for safety.
//
// `home`, `pathEnv`, and `exeName` are passed in rather than
// read from the environment so the function is fully testable
// in isolation. Callers should pass the real values from the
// Node runtime.
export function resolveLanguageServerPath(
  configOverride: string,
  pathEnv: string,
  home: string,
  exeName: string,
): string {
  if (configOverride && configOverride.trim() !== "") {
    return configOverride
  }
  const inPath = findBinaryInPath(exeName, pathEnv)
  if (inPath) {
    return inPath
  }
  if (process.platform !== "win32") {
    const inHome = findBinaryInHome(exeName, home)
    if (inHome) {
      return inHome
    }
  }
  return DEV_FALLBACK_PATHS[process.platform] ?? exeName
}
