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

The extension currently starts a Language Server by executing a binary at a hardcoded path in `src/extension.ts`:
`C:\Users\Dominykas\Documents\Development\hybroid\build\hybroid-windows-x86_64.exe`

If you are developing on a different machine or have the binary in a different location, you must update the `serverExecutable` constant in `src/extension.ts`.

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
