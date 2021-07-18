import { DefinedColor, HEX, HSL, MatchingColor, RGB } from '@/ntc/interfaces'
import { colorNames } from '@/ntc/color-names'

/**
 * ntc.js (Name that Color JavaScript)
 *
 * Created original code by [Chirag Mehta](http://chir.ag/projects/ntc)
 */
export class NameThatColor {
    names: DefinedColor[] = []

    constructor(names = colorNames) {
        for (let i = 0; i < names.length; i++) {
            const [hexCode, colorName] = names[i]
            const hex: HEX = `#${hexCode}`
            const [r, g, b] = this.toRGB(hex)
            const [h, s, l] = this.toHSL(hex)

            this.names.push([hexCode, colorName, r, g, b, h, s, l])
        }
    }

    getName(hex: HEX): MatchingColor | null {
        hex = hex.toUpperCase()

        if (hex.length < 3 || hex.length > 7) {
            return null
        }

        if (hex.length % 3 === 0) {
            hex = `#${hex}`
        }

        if (hex.length === 4) {
            hex =
                '#' +
                hex.substr(1, 1).repeat(2) +
                hex.substr(2, 1).repeat(2) +
                hex.substr(3, 1).repeat(2)
        }

        const [r, g, b] = this.toRGB(hex)
        const [h, s, l] = this.toHSL(hex)

        let ndf1 = 0
        let ndf2 = 0
        let ndf = 0

        let cl = -1
        let df = -1

        for (let i = 0; i < this.names.length; i++) {
            if (hex === '#' + this.names[i][0]) {
                return ['#' + this.names[i][0], this.names[i][1], 0]
            }

            const [
                ,
                ,
                rowR = 0,
                rowG = 0,
                rowB = 0,
                rowH = 0,
                rowS = 0,
                rowL = 0,
            ] = this.names[i]

            ndf1 =
                Math.pow(r - rowR, 2) +
                Math.pow(g - rowG, 2) +
                Math.pow(b - rowB, 2)

            ndf2 =
                Math.pow(h - rowH, 2) +
                Math.pow(s - rowS, 2) +
                Math.pow(l - rowL, 2)

            ndf = ndf1 + ndf2 * 2

            if (df < 0 || df > ndf) {
                df = ndf
                cl = i
            }
        }

        return cl < 0 ? null : ['#' + this.names[cl][0], this.names[cl][1], df]
    }

    /**
     * adopted from: Farbtastic 1.2
     * http://acko.net/dev/farbtastic
     */
    toHSL(color: HEX): HSL {
        const rgb = [
            parseInt('0x' + color.substring(1, 3)) / 255,
            parseInt('0x' + color.substring(3, 5)) / 255,
            parseInt('0x' + color.substring(5, 7)) / 255,
        ]

        const r = rgb[0]
        const g = rgb[1]
        const b = rgb[2]

        const min = Math.min(r, Math.min(g, b))
        const max = Math.max(r, Math.max(g, b))
        const delta = max - min

        let h = 0
        let s = 0
        const l = (min + max) / 2

        if (l > 0 && l < 1) {
            s = delta / (l < 0.5 ? 2 * l : 2 - 2 * l)
        }

        if (delta > 0) {
            if (max === r && max !== g) {
                h += (g - b) / delta
            }
            if (max === g && max !== b) {
                h += 2 + (b - r) / delta
            }
            if (max === b && max !== r) {
                h += 4 + (r - g) / delta
            }

            h /= 6
        }

        return [
            parseInt(String(h * 255)),
            parseInt(String(s * 255)),
            parseInt(String(l * 255)),
        ]
    }

    /**
     * adopted from: Farbtastic 1.2
     * http://acko.net/dev/farbtastic
     */
    toRGB(color: HEX): RGB {
        return [
            parseInt('0x' + color.substring(1, 3)),
            parseInt('0x' + color.substring(3, 5)),
            parseInt('0x' + color.substring(5, 7)),
        ]
    }
}
