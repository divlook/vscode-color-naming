import { ColorNaming } from '@/color-naming'
import { ntc } from '@/ntc'
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
                return [
                    new ColorNamingTreeItem(`Input HEX: ${result.input}`, {
                        copiedText: result.input,
                    }),
                    new ColorNamingTreeItem(`Output HEX: ${result.hex}`, {
                        copiedText: result.hex,
                    }),
                    new ColorNamingTreeItem(`Color name: ${result.colorName}`, {
                        copiedText: result.colorName,
                    }),
                    new ColorNamingTreeItem(
                        `Difference: ${result.difference}`,
                        {
                            copiedText: `${result.difference}`,
                        }
                    ),
                    ...Array.from(ColorNaming.getCaseData(result).values()).map(
                        (row) => {
                            return new ColorNamingTreeItem(
                                `${row.caseType}: ${row.caseName}`,
                                {
                                    data: result,
                                    copiedText: row.caseName,
                                }
                            )
                        }
                    ),
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

                colors[row] = {
                    input: row,
                    hex,
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
    copiedText = ''
    data: ColorNaming.Output = {
        colorName: '',
        hex: '',
        input: '',
        difference: 0,
    }

    constructor(
        public readonly label: string,
        options: {
            root?: boolean
            collapsibleState?: vscode.TreeItemCollapsibleState
            command?: vscode.Command
            copiedText?: string
            data?: ColorNamingTreeItem['data']
        } = {}
    ) {
        super(label, options.collapsibleState)

        this.label = label
        this.root = options.root || false
        this.copiedText = options.copiedText || ''
        this.collapsibleState = options.collapsibleState
        this.command = options.command

        Object.assign(this.data, options.data)

        if (!this.root) {
            this.contextValue = 'color-naming.items'
        }
    }
}
