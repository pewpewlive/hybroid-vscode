# Hybroid Live language support for Visual Studio Code

A VS Code extension that provides syntax highlighting, snippets and language server support for Hybroid.

## Configuration

- `hybroid.languageServerPath`: Path to the Hybroid Language Server executable. If not specified, the hardcoded default will be used.
- `hybroid.trace.server`: Traces the communication between VS Code and the language server.

## Commands

- `Hybroid: Restart Language Server`: Restarts the Hybroid Language Server.

## License

This project is licensed under MIT license.

### Syntax highlighting

The syntax highlighting is based on [VS Code default Rust syntax definition](https://github.com/microsoft/vscode/blob/main/extensions/rust/syntaxes/rust.tmLanguage.json).
