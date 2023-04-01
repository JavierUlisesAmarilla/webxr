import {floatStrTrim} from '../../utils/common'
import {DIM_CENTIMETER, FLOAT_DIGITS, SCALE} from '../../utils/constants'


const config = {
  dimUnit: DIM_CENTIMETER,
  scale: SCALE,
}


/**
 * Config
 */
export class Config {
  /**
   * Set config value
   *
   * @param {string} key
   * @param {any} value
   */
  static setValue(key, value) {
    config[key] = value
  }


  /**
   * Get config value
   *
   * @param {string} key
   * @return {any}
   */
  static getValue(key) {
    return config[key]
  }


  /**
   * Get numeric config value
   *
   * @param {string} key
   * @param {number} floatDigits
   * @return {number} float
   */
  static getNumericValue(key, floatDigits = FLOAT_DIGITS) {
    return floatStrTrim(Config.getValue(key), floatDigits)
  }


  /**
   * Get string config value
   *
   * @param {string} key
   * @return {string}
   */
  static getStringValue(key) {
    return String(Config.getValue(key))
  }
}
