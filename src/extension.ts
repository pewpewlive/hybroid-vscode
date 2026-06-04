import { workspace, ExtensionContext, commands, window } from "vscode"

import { LanguageClient, LanguageClientOptions, ServerOptions } from "vscode-languageclient/node"

import { homedir } from "os"
import { resolveLanguageServerPath } from "./path-resolver"

let client: LanguageClient

function getLanguageServerPath(): string {
  const config = workspace.getConfiguration("hybroid")
  const override = config.get<string>("languageServerPath") ?? ""
  const exeName = process.platform === "win32" ? "hybroid.exe" : "hybroid"
  return resolveLanguageServerPath(override, process.env.PATH ?? "", homedir(), exeName)
}

async function startLanguageServer() {
  console.log("Starting the language server...")

  const serverExecutable = getLanguageServerPath()

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
  try {
    await client.start()
    console.log("HybroidLS was started")
  } catch (err) {
    window.showErrorMessage(`Failed to start Hybroid Language Server: ${err}`)
  }
}

export async function activate(context: ExtensionContext) {
  await startLanguageServer()

  context.subscriptions.push(
    workspace.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration("hybroid.languageServerPath")) {
        const selection = await window.showInformationMessage(
          "Hybroid Language Server path has changed. Do you want to restart the server?",
          "Restart Now"
        )
        if (selection === "Restart Now") {
          await commands.executeCommand("hybroid.restartLanguageServer")
        }
      }
    })
  )

  context.subscriptions.push(
    commands.registerCommand("hybroid.restartLanguageServer", async () => {
      console.log("Restarting HybroidLS...")
      if (client) {
        try {
          await client.stop()
          await client.dispose()
        } catch (err) {
          console.error("Error stopping language client:", err)
        }
        client = (undefined as any)
      }
      await startLanguageServer()
      window.showInformationMessage("HybroidLS restarted.")
    })
  )
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined
  }
  return client.stop()
}
