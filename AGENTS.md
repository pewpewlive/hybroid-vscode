# Hybroid VS Code Extension - Developer Guide

This extension provides language support for the **Hybroid** programming language in Visual Studio Code.

## Project Overview

The project is a VS Code extension written in TypeScript. It integrates with a Language Server Protocol (LSP) server to provide advanced language features.

### Core Technologies

- **TypeScript**: Main development language.
- **VS Code API**: For extension functionality.
- **vscode-languageclient**: For communication with the Hybroid Language Server.
- **TextMate Grammar**: For syntax highlighting.

## Directory Structure

- `src/extension.ts`: The main entry point. It activates the extension and starts the Language Server client.
- `syntaxes/hybroid.tmLanguage.json`: Defines the syntax highlighting rules using TextMate grammar.
- `language-configuration.json`: Configures language-specific features like auto-closing pairs, brackets, and comment symbols.
- `snippets/hybroid.code-snippets`: Contains code snippets for the Hybroid language.

## Building and Running

### Prerequisites

- [Node.js](https://nodejs.org/)
- [VSCE](https://github.com/microsoft/vscode-vsce) (for packaging): `npm install -g @vscode/vsce`

### Commands

- **Compile**: `npm run compile`
- **Watch**: `npm run watch` (for incremental builds during development)
- **Lint**: `npm run lint` (Note: currently configured to look in `client/src` and `server/src` which may need adjustment)
- **Package**: `vsce package`

### Debugging

Press `F5` in VS Code to launch a new "Extension Development Host" window with the Hybroid extension loaded.

## Language Server

The extension starts a Language Server by resolving the binary path in this order (`src/extension.ts`):

1. The `hybroid.languageServerPath` user setting, if set.
2. On non-Windows: a search of well-known install locations (`~/.hybroid/hybroid`, `~/.local/bin/hybroid`, `/usr/local/bin/hybroid`, `/opt/homebrew/bin/hybroid`).
3. The platform-specific fallback in `DEV_FALLBACK_PATHS` (currently Windows only).
4. The bare command name (`hybroid` / `hybroid.exe`).

This ordering exists because VS Code on macOS is launched with a sanitized `PATH` that does not include shell-managed entries (e.g. `~/.hybroid`), so a bare-command spawn can fail with `ENOENT` even when the shell can run it.

To run a freshly built Go binary during development, set the user setting to the absolute path of the binary, e.g.:

- macOS: `/Users/you/code/hybroid-live/hybroid`
- Linux: `/home/you/code/hybroid-live/hybroid`
- Windows: `C:\Users\you\Development\hybroid-live\hybroid.exe`

To update a globally installed copy on macOS:
```
cp hybroid ~/.hybroid/hybroid
```

The Go CLI exposes the `language-server` subcommand, which is what the client invokes.

## Development Conventions

### Syntax Highlighting

The grammar is defined in `syntaxes/hybroid.tmLanguage.json`. It covers:

- Keywords (`fn`, `let`, `if`, `else`, `match`, `spawn`, `struct`, `entity`, etc.)
- Types (`number`, `fixed`, `bool`, `text`)
- Strings (single and double quoted)
- Comments (`//` and `/* */`)
- Numbers (decimal, hex, octal, binary, float)
- Function calls and arguments

### Tests

Tests are located in `src/test/` and use the Mocha framework. They are integration tests that verify features like completion and diagnostics by interacting with the VS Code API.

### Code Style

The project uses ESLint and TypeScript for maintaining code quality. Refer to `.eslintrc.json` (if present) or follow the existing patterns in `src/extension.ts`.
