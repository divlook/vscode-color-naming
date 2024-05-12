![](https://img.shields.io/github/v/release/divlook/vscode-color-naming)

# Color Naming

A VS Code Extension that names colors using [ntc.js](https://chir.ag/projects/ntc)

> [ntc.js](https://chir.ag/projects/ntc)를 사용해서 색상의 이름을 지정하는 VS Code Extension입니다.

- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=divlook.color-naming)
- [Github](https://github.com/divlook/vscode-color-naming)

## Features

![](images/color-naming_2021-07-18.gif)

Among the defined names, the name that matches or has the most similar color to the selected HEX Code is saved to the clipboard.

> 정의된 이름 중 선택된 HEX Code와 일치하거나 가장 유사한 색깔의 이름을 클립보드에 저장합니다.

- ex) #000 -> black
- ex) #111 -> cod-gray-180

## Extension Settings

- `"colorNaming.caseStyle": "Kebab"`

    NAME            | DESC
    ----------------|------------------------------
    Kebab (default) | ex) kebab-case, light-gray-10
    Camel           | ex) camelCase, lightGray_10

## References

- [VSCode API](https://code.visualstudio.com/api/references/vscode-api)

## Open Source Credits

- [ntc js (Name that Color JavaScript)](https://chir.ag/projects/ntc)
- [Change Case](https://github.com/blakeembrey/change-case)
