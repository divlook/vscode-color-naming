import * as vscode from 'vscode'

export const copyText = (copiedText: string) => {
    vscode.env.clipboard.writeText(copiedText).then(() => {
        vscode.window.showInformationMessage(`Copied: ${copiedText}`)
    })
}
