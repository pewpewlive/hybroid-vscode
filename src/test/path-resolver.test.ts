import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { mkdirSync, realpathSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"

import { findBinaryInPath, resolveLanguageServerPath } from "../path-resolver"

// Each test creates a fresh temp dir under os.tmpdir() and
// stages fake binaries in it. We clean up after the suite so
// successive `bun test` runs and the in-editor build don't
// accumulate artifacts in the repo.

let testDir: string

beforeEach(() => {
  testDir = mkdirSync(join(tmpdir(), `hybroid-resolver-${crypto.randomUUID()}`), {
    recursive: true,
  })
})

afterEach(() => {
  rmSync(testDir, { recursive: true, force: true })
})

// stageBinary creates an empty file at <testDir>/<rel>/<name>
// and returns the absolute path. `rel` is a path relative to
// testDir (can be a nested directory like ".hybroid" or
// "usr/bin") so tests can simulate well-known install layouts
// without each test having to mkdir every ancestor.
function stageBinary(rel: string, name: string): string {
  const dir = join(testDir, rel)
  mkdirSync(dir, { recursive: true })
  const full = join(dir, name)
  writeFileSync(full, "")
  return full
}

describe("findBinaryInPath", () => {
  test("finds binary in a single PATH entry", () => {
    const expected = stageBinary("bin", "hybroid")
    const got = findBinaryInPath("hybroid", testDir + "/bin")
    expect(got).toBe(expected)
  })

  test("skips empty PATH entries", () => {
    const expected = stageBinary("bin", "hybroid")
    const got = findBinaryInPath("hybroid", `::${testDir}/bin::`)
    expect(got).toBe(expected)
  })

  test("resolves relative PATH entries against cwd", () => {
    // Stage the binary directly in a temp dir, then chdir
    // there and put "." on PATH. The resolver must produce
    // an absolute path, not "./hybroid".
    const cwd = join(testDir, "cwd")
    mkdirSync(cwd, { recursive: true })
    const staged = stageBinary("cwd", "hybroid")
    // On macOS, /tmp is a symlink to /private/tmp, and so is
    // /var/folders. process.cwd() returns the symlink form
    // (as the OS exposes it), but path.resolve() canonicalizes
    // to the real path. Use realpathSync to compare apples
    // to apples.
    const expected = realpathSync(staged)
    const prevCwd = process.cwd()
    process.chdir(cwd)
    try {
      const got = findBinaryInPath("hybroid", ".")
      expect(got).toBe(expected)
      expect(got).not.toMatch(/^\.\//)
    } finally {
      process.chdir(prevCwd)
    }
  })

  test("returns undefined when no entry matches", () => {
    const got = findBinaryInPath("hybroid", "/nonexistent/a:/nonexistent/b")
    expect(got).toBeUndefined()
  })

  test("returns the first match when multiple dirs contain the binary", () => {
    const first = stageBinary("dir1", "hybroid")
    stageBinary("dir2", "hybroid")
    const got = findBinaryInPath(
      "hybroid",
      `${testDir}/dir1${pathSep()}${testDir}/dir2`,
    )
    expect(got).toBe(first)
  })
})

describe("resolveLanguageServerPath", () => {
  test("config override wins over PATH and home", () => {
    const override = "/my/custom/hybroid"
    const got = resolveLanguageServerPath(
      override,
      "/nonexistent",
      "/nonexistent",
      "hybroid",
    )
    expect(got).toBe(override)
  })

  test("config override with surrounding whitespace is honored verbatim", () => {
    // A user typing a space into the setting by accident
    // should still see their override honored, because the
    // setting text is preserved.
    const override = "  /my/custom/hybroid  "
    const got = resolveLanguageServerPath(
      override,
      "/nonexistent",
      "/nonexistent",
      "hybroid",
    )
    expect(got).toBe(override)
  })

  test("PATH is searched before ~/.hybroid", () => {
    const onPath = stageBinary("path-bin", "hybroid")
    stageBinary(".hybroid", "hybroid")
    const got = resolveLanguageServerPath(
      "",
      testDir + "/path-bin",
      testDir,
      "hybroid",
    )
    expect(got).toBe(onPath)
  })

  test("~/.hybroid is used when PATH misses", () => {
    const expected = stageBinary(".hybroid", "hybroid")
    const got = resolveLanguageServerPath(
      "",
      "/nonexistent",
      testDir,
      "hybroid",
    )
    expect(got).toBe(expected)
  })

  test("falls through to bare exeName when nothing matches", () => {
    const got = resolveLanguageServerPath(
      "",
      "/nonexistent",
      "/nonexistent",
      "hybroid",
    )
    expect(got).toBe("hybroid")
  })

  test("whitespace-only config override falls through to PATH", () => {
    // " " alone is treated as no override and the resolver
    // continues with PATH → home → bare name.
    const expected = stageBinary("path-bin", "hybroid")
    const got = resolveLanguageServerPath(
      " ",
      testDir + "/path-bin",
      "/nonexistent",
      "hybroid",
    )
    expect(got).toBe(expected)
  })
})

// pathSep returns the platform PATH separator. We use a helper
// so the test file reads identically on every host — bun test
// runs all files unconditionally, so writing `;` or `:`
// inline would be platform-fragile.
function pathSep(): string {
  return process.platform === "win32" ? ";" : ":"
}
