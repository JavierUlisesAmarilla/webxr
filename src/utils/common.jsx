import {assertDefined} from './assert'
import {FLOAT_DIGITS} from './constants'


/**
 * Convert a string-encoded float or number to a truncated float, of fixed-length `len` or no decimal point expansion
 * - 'string' -> 0
 * - '0' -> 0
 * - '12.34567' -> 12.346
 * - '12.340' -> 12.34
 * - '12.300' -> 12.3
 * - '12.000' -> 12
 *
 * @param {string|number} str
 * @param {number} floatDigits
 * @return {number} float
 */
export const floatStrTrim = (str, floatDigits = FLOAT_DIGITS) => {
  assertDefined(str, floatDigits)
  let floatStr
  if (typeof str === 'string') {
    floatStr = parseFloat(str)
  } else {
    floatStr = str
  }
  if (!floatStr) {
    floatStr = 0
  }
  const val = Number(floatStr.toFixed(floatDigits))
  if (!isFinite(val)) {
    throw new Error('Parameter is invalid.')
  }
  return val
}


export const getThreeEnv = ({domEl}) => {
  assertDefined(domEl)
  const elRect = domEl.getBoundingClientRect()
  const domWidth = elRect.width
  const domHeight = elRect.height
  const aspect = domWidth / domHeight
  return {
    domWidth,
    domHeight,
    aspect,
  }
}
