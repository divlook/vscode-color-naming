import * as vscode from 'vscode'
import { fromSelectedText } from '@/color-naming'
import { ColorNamingTreeProvider } from '@/color-naming/tree'

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'color-naming.fromSelectedText',
            fromSelectedText
        )
    )

    const colorNamingTreeProvider = new ColorNamingTreeProvider()

    vscode.window.registerTreeDataProvider(
        'color-naming-view',
        colorNamingTreeProvider
    )
}

export function deactivate() {}
