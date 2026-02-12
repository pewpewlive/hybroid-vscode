import { workspace, ExtensionContext } from "vscode"

import { LanguageClient, LanguageClientOptions, ServerOptions } from "vscode-languageclient/node"

let client: LanguageClient

export function activate(context: ExtensionContext) {
  console.log("Starting the language server...")

  const serverExecutable =
    "C:\\Users\\Dominykas\\Documents\\Development\\hybroid\\build\\hybroid-windows-x86_64.exe"

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { command: serverExecutable, args: ["language-server"] },
    debug: { command: serverExecutable, args: ["language-server", "--debug"] },
  }

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for hybroid source files
    documentSelector: [{ scheme: "file", language: "hybroid" }],
    synchronize: {
      // Notify the server about file changes to '.clientrc files contained in the workspace
      fileEvents: workspace.createFileSystemWatcher("**/.clientrc"),
    },
  }

  // Create the language client and start the client.
  client = new LanguageClient("hybroidLS", "HybroidLS", serverOptions, clientOptions)

  // Start the client. This will also launch the server
  client.start()
  console.log("HybroidLS was started")
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined
  }
  return client.stop()
}
