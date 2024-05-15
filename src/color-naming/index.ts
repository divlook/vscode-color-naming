import { Config } from '@/color-naming/interfaces'
import {
    ColorNamingTreeItem,
    ColorNamingTreeProvider,
} from '@/color-naming/tree'
import { ntc } from '@/ntc'
import { copyText } from '@/utils/text'
import { camelCase, paramCase } from 'change-case'
import * as vscode from 'vscode'

export namespace ColorNaming {
    export interface Output {
        colorName: string
        difference: number
    }

    export interface Cache {
        text: string
        colors: Record<string, Output>
        timerId: NodeJS.Timeout | null
        deleteTimerId: NodeJS.Timeout | null
    }

    export const getConfig = () => {
        const config = vscode.workspace.getConfiguration('colorNaming')

        return config as typeof config & Config
    }

    export const initialize = (context: vscode.ExtensionContext) => {
        const colorNamingTreeProvider = new ColorNamingTreeProvider()

        context.subscriptions.push(
            vscode.commands.registerCommand(
                'color-naming.fromSelectedText',
                fromSelectedText
            )
        )

        context.subscriptions.push(
            vscode.commands.registerCommand(
                'color-naming.copyTextFromViewItem',
                async (element?: ColorNamingTreeItem) => {
                    if (!element) {
                        return
                    }

                    const copiedText = element?.data.colorName

                    if (!copiedText) {
                        return
                    }

                    copyText(copiedText)
                }
            )
        )

        vscode.window.registerTreeDataProvider(
            'color-naming-view',
            colorNamingTreeProvider
        )
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

        copyText(convertedName)
    }
}
