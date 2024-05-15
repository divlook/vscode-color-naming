import { ColorNaming } from '@/color-naming'
import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
    ColorNaming.initialize(context)
}

export function deactivate() {}
