import * as vscode from 'vscode'
import { fromSelectedText } from '@/color-naming'

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(
        'color-naming.fromSelectedText',
        fromSelectedText
    )

    context.subscriptions.push(disposable)
}

export function deactivate() {}
