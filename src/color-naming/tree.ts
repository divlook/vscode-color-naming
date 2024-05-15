import { ColorNaming } from '@/color-naming'
import { ntc } from '@/ntc'
import { camelCase, paramCase } from 'change-case'
import * as vscode from 'vscode'

export class ColorNamingTreeProvider
    implements vscode.TreeDataProvider<ColorNamingTreeItem>
{
    /**
     * Map<fileName, ColorNaming.Cache>
     */
    cacheMap = new Map<string, ColorNaming.Cache>()

    constructor() {
        vscode.window.onDidChangeActiveTextEditor(() =>
            this.onActiveEditorChanged()
        )

        vscode.workspace.onDidChangeTextDocument((ev) => {
            this.parse(ev.document.fileName, ev.document.getText())
        })

        this.onActiveEditorChanged()
    }

    getTreeItem(
        element: ColorNamingTreeItem
    ): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element
    }

    getChildren(
        element?: ColorNamingTreeItem
    ): vscode.ProviderResult<ColorNamingTreeItem[]> {
        const fileName = vscode.window.activeTextEditor?.document.fileName || ''
        const cache = this.cacheMap.get(fileName)

        if (element) {
            const result = cache?.colors[element.label]

            if (element.root && result) {
                const colorName = `${result.colorName} ${result.difference}`
                const camelCaseName = camelCase(colorName)
                const paramCaseName = paramCase(colorName)

                return [
                    new ColorNamingTreeItem(`camelCase: ${camelCaseName}`, {
                        data: {
                            colorName: camelCaseName,
                        },
                    }),
                    new ColorNamingTreeItem(`param-case: ${paramCaseName}`, {
                        data: {
                            colorName: paramCaseName,
                        },
                    }),
                ]
            }

            return []
        }

        if (!cache) {
            vscode.commands.executeCommand(
                'setContext',
                'color-naming.colors',
                0
            )
            return []
        }

        const keys = Object.keys(cache.colors)

        vscode.commands.executeCommand(
            'setContext',
            'color-naming.colors',
            keys.length
        )

        return keys.map((hex) => {
            return new ColorNamingTreeItem(hex, {
                root: true,
                collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
            })
        })
    }

    private _onDidChangeTreeData: vscode.EventEmitter<
        ColorNamingTreeItem | undefined | null | void
    > = new vscode.EventEmitter<ColorNamingTreeItem | undefined | null | void>()
    readonly onDidChangeTreeData: vscode.Event<
        ColorNamingTreeItem | undefined | null | void
    > = this._onDidChangeTreeData.event

    refresh(): void {
        this._onDidChangeTreeData.fire()
    }

    onActiveEditorChanged() {
        if (!vscode.window.activeTextEditor) {
            return
        }

        this.parse(
            vscode.window.activeTextEditor.document.fileName,
            vscode.window.activeTextEditor.document.getText()
        )
    }

    parse(fileName: string, text: string) {
        const getCache = () => {
            return (
                this.cacheMap.get(fileName) ||
                ({
                    text,
                    colors: {},
                    timerId: null,
                    deleteTimerId: null,
                } as ColorNaming.Cache)
            )
        }
        const saveCache = (data: ColorNaming.Cache) => {
            this.cacheMap.set(fileName, data)
        }

        const cache = getCache()

        saveCache(cache)

        if (cache.timerId) {
            clearTimeout(cache.timerId)
        }

        cache.timerId = setTimeout(() => {
            const cache = getCache()
            const colors: ColorNaming.Cache['colors'] = {}

            Array.from(
                new Set(cache.text.match(/#[a-zA-Z0-9]{3,6}/g) || [])
            ).forEach((row) => {
                const match = ntc.getName(row)

                if (!match) {
                    return
                }

                const [hex, colorName, difference] = match

                colors[hex] = {
                    colorName,
                    difference,
                }
            })

            cache.colors = colors

            if (cache.deleteTimerId) {
                clearTimeout(cache.deleteTimerId)
            }

            cache.deleteTimerId = setTimeout(
                () => {
                    this.cacheMap.delete(fileName)
                },
                5 * 60 * 1000
            )

            saveCache(cache)

            this.refresh()
        }, 500)
    }
}

export class ColorNamingTreeItem extends vscode.TreeItem {
    root = false
    data = {
        colorName: '',
    }

    constructor(
        public readonly label: string,
        options: {
            root?: boolean
            collapsibleState?: vscode.TreeItemCollapsibleState
            command?: vscode.Command
            data?: ColorNamingTreeItem['data']
        } = {}
    ) {
        super(label, options.collapsibleState)

        this.label = label
        this.root = options.root || false
        this.collapsibleState = options.collapsibleState
        this.command = options.command

        Object.assign(this.data, options.data)

        if (!this.root) {
            this.contextValue = 'color-naming.items'
        }
    }
}
