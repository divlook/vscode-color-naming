import * as vscode from 'vscode'
import { camelCase, paramCase } from 'change-case'
import { ntc } from '@/ntc'
import { Config } from '@/color-naming/interfaces'

export const getConfig = () => {
    const config = vscode.workspace.getConfiguration('colorNaming')

    return config as typeof config & Config
}

export const fromSelectedText = async () => {
    const config = getConfig()
    const editor = vscode.window.activeTextEditor

    if (!editor) {
        vscode.window.showInformationMessage('Editor does not exist')
        return
    }

    const selectedText = editor.document.getText(editor.selection)
    const match = ntc.getName(selectedText)

    if (!match) {
        vscode.window.showInformationMessage('No matching colors')
        return
    }

    let convertedName: string
    let [, colorName, difference] = match

    if (difference) {
        colorName += ` ${difference}`
    }

    switch (config.caseStyle) {
        case 'Camel': {
            convertedName = camelCase(colorName)
            break
        }
        default: {
            convertedName = paramCase(colorName)
        }
    }

    await vscode.env.clipboard.writeText(convertedName)

    vscode.window.showInformationMessage(`Copied color name: ${convertedName}`)
}
