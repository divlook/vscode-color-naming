export type HEX = string

export type RGB = [number, number, number]

export type HSL = [number, number, number]

/**
 * Defined Color
 *
 * @example ['000000', 'Black', r, g, b, h, s, l]
 */
export type DefinedColor = [
    string,
    string,
    number?,
    number?,
    number?,
    number?,
    number?,
    number?,
]

/**
 * The closest matching color
 *
 * type MatchingColor = [hexCode, colorName, difference]
 * - hexCode: string (This is the HEX value of the closest matching color)
 * - colorName: string (This is the text string for the name of the match)
 * - difference: number (difference)
 */
export type MatchingColor = [string, string, number]
