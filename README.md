# Hybroid Live language support for Visual Studio Code

A VS Code extension that provides syntax highlighting, snippets and language server support for Hybroid.

## Usage:

Download this extension:

- Visual Studio Code marketplace: (coming soon)
- `.vsix` extension: [GitHub Releases](https://github.com/pewpewlive/hybroid-vscode/releases/latest)

## Configuration

- `hybroid.languageServerPath`: Path to the Hybroid Language Server executable. If not specified, the hardcoded default will be used.
- `hybroid.trace.server`: Traces the communication between VS Code and the language server.

## Commands

- `Hybroid: Restart Language Server`: Restarts the Hybroid Language Server.

## Building it

1. Download Bun (if you don't have it already)
2. Clone this repository
3. Run `bun install` to install dependencies
4. Download VSCE: `bun add -g @vscode/vsce`
5. Run `vsce package` to build the extension. You should see a `.vsix` file in the root of the project.

## License

This project is licensed under MIT license.

### Syntax highlighting

The syntax highlighting is based on [VS Code default Rust syntax definition](https://github.com/microsoft/vscode/blob/main/extensions/rust/syntaxes/rust.tmLanguage.json).
