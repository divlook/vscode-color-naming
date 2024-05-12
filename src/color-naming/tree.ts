import * as vscode from 'vscode'
import { ntc } from '@/ntc'

interface ColorCache {
    text: string
    colors: Record<string, any>
    timerId: NodeJS.Timeout | null
    deleteTimerId: NodeJS.Timeout | null
}

export class ColorNamingTreeProvider
    implements vscode.TreeDataProvider<ColorNamingTreeItem>
{
    /**
     * Map<fileName, ColorCache>
     */
    cacheMap = new Map<string, ColorCache>()

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

        if (element || !cache) {
            return []
        }

        return Object.keys(cache.colors).map((hex) => {
            const colorName = cache.colors[hex]

            return new ColorNamingTreeItem(`${hex}: ${colorName}`, {
                collapsibleState: vscode.TreeItemCollapsibleState.None,
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
                } as ColorCache)
            )
        }
        const saveCache = (data: ColorCache) => {
            this.cacheMap.set(fileName, data)
        }

        const cache = getCache()

        saveCache(cache)

        if (cache.timerId) {
            clearTimeout(cache.timerId)
        }

        vscode.window.showInformationMessage(fileName)

        cache.timerId = setTimeout(() => {
            const cache = getCache()
            const colors: ColorCache['colors'] = {}

            Array.from(
                new Set(cache.text.match(/#[a-zA-Z0-9]{3,6}/g) || [])
            ).forEach((row) => {
                const match = ntc.getName(row)

                if (!match) {
                    return
                }

                const [hex, colorName] = match
                colors[hex] = colorName
            })

            cache.colors = colors

            if (cache.deleteTimerId) {
                clearTimeout(cache.deleteTimerId)
            }

            cache.deleteTimerId = setTimeout(() => {
                this.cacheMap.delete(fileName)
            }, 5 * 60 * 1000)

            saveCache(cache)

            this.refresh()
        }, 500)
    }
}

export class ColorNamingTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        options: {
            collapsibleState?: vscode.TreeItemCollapsibleState
            command?: vscode.Command
        } = {}
    ) {
        super(label, options.collapsibleState)

        this.label = label
        this.collapsibleState = options.collapsibleState
        this.command = options.command
    }
}
