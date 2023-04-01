import {Vector2} from 'three'
import {MathUtils} from 'three'
import {checkIntersection} from 'line-intersect'


/**
 * Utils
 */
export class Utils {
  /**
   * Determines the distance of a point from a line
   *
   * @param {Vector2} point The Point coordinates
   * @param {Vector2} start The starting coordinates of the line
   * @param {Vector2} end The ending coordinates of the line
   * @return {number} The distance value
   */
  static pointDistanceFromLine(point, start, end) {
    const tPoint = Utils.closestPointOnLine(point, start, end)
    const tDx = point.x - tPoint.x
    const tDy = point.y - tPoint.y
    return Math.sqrt((tDx * tDx) + (tDy * tDy))
  }


  /**
   * Gets the projection of a point onto a line
   *
   * @param {Vector2} point The point
   * @param {Vector2} start The starting coordinates of the line
   * @param {Vector2} end The ending coordinates of the line
   * @return {Vector2} The point
   */
  static closestPointOnLine(point, start, end) {
    // Inspired by: http://stackoverflow.com/a/6853926
    const tA = point.x - start.x
    const tB = point.y - start.y
    const tC = end.x - start.x
    const tD = end.y - start.y

    const tDot = (tA * tC) + (tB * tD)
    const tLenSq = (tC * tC) + (tD * tD)
    const tParam = tDot / tLenSq

    let tXx; let tYy

    if (tParam < 0 || (start.x === end.x && start.y === end.y)) {
      tXx = start.x
      tYy = start.y
    } else if (tParam > 1) {
      tXx = end.x
      tYy = end.y
    } else {
      tXx = start.x + (tParam * tC)
      tYy = start.y + (tParam * tD)
    }

    return new Vector2(tXx, tYy)
  }


  /**
   * Gets the distance of two points
   *
   * @param {Vector2} start The starting coordinate of the line
   * @param {Vector2} end The ending coordinate of the line
   * @return {number} The distance
   */
  static distance(start, end) {
    return Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2),
    )
  }


  /**
   * Gets the angle between point1 -> start and 0,0 -> point2 (-pi to pi)
   *
   * @return {number} The angle
   */
  static angle(start, end) {
    const tDot = (start.x * end.x) + (start.y * end.y)
    const tDet = (start.x * end.y) - (start.y * end.x)
    const tAngle = -Math.atan2(tDet, tDot)
    return tAngle
  }


  /**
   * Shifts angle to be 0 to 2pi
   *
   * @return {number} The angle
   */
  static angle2pi(start, end) {
    let tTheta = Utils.angle(start, end)
    if (tTheta < 0) {
      tTheta += 2.0 * Math.PI
    }
    return tTheta
  }


  /**
   * Shifts angle to be 0 to 2pi
   *
   * @return {number} The angle
   */
  static getCyclicOrder(points, start = undefined) {
    if (!start) {
      start = new Vector2(0, 0)
    }
    const angles = []
    let i
    for (i = 0; i < points.length; i++) {
      const point = points[i]
      const vector = point.clone().sub(start)
      const radians = Math.atan2(vector.y, vector.x)
      let degrees = MathUtils.radToDeg(radians)
      degrees = degrees > 0 ? degrees : (degrees + 360) % 360
      angles.push(degrees)
    }
    const indices = Utils.argSort(angles)
    const sortedAngles = []
    const sortedPoints = []
    for (i = 0; i < indices.length; i++) {
      sortedAngles.push(angles[indices[i]])
      sortedPoints.push(points[indices[i]])
    }
    return {indices: indices, angles: sortedAngles, points: sortedPoints}
  }


  /**
   * @param {Array} numericalValues
   * @param {number} direction
   * @return {Array} Sorted arguments
   */
  static argSort(numericalValues, direction = 1) {
    const indices = Array.from(
        new Array(numericalValues.length),
        (val, index) => index,
    )
    return indices
        .map((item, index) => [numericalValues[index], item]) // Add the clickCount to sort by
        .sort(([count1], [count2]) => (count1 - count2) * direction) // Sort by the clickCount data
        .map(([, item]) => item) // Extract the sorted items
  }


  /**
   * Checks if an array of points is clockwise
   *
   * @param points Is array of points with x,y attributes
   * @return {boolean}
   */
  static isClockwise(points) {
    // make positive
    const tSubX = Math.min(
        0,
        Math.min.apply(
            null,
            Utils.map(points, function(p) {
              return p.x
            }),
        ),
    )

    const tSubY = Math.min(
        0,
        Math.min.apply(
            null,
            Utils.map(points, function(p) {
              return p.x
            }),
        ),
    )

    const tNewPoints = Utils.map(points, function(p) {
      return {
        x: p.x - tSubX,
        y: p.y - tSubY,
      }
    })

    // determine CW/CCW, based on:
    // http://stackoverflow.com/questions/1165647
    let tSum = 0
    for (let tI = 0; tI < tNewPoints.length; tI++) {
      const tC1 = tNewPoints[tI]
      let tC2
      if (tI === tNewPoints.length - 1) {
        tC2 = tNewPoints[0]
      } else {
        tC2 = tNewPoints[tI + 1]
      }
      tSum += (tC2.x - tC1.x) * (tC2.y + tC1.y)
    }
    return tSum >= 0
  }


  /**
   * Creates a guide
   *
   * @return {string} A new guide
   */
  static guide() {
    const tS4 = function() {
      return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1)
    }
    return (
      `${tS4() +
      tS4()
      }-${tS4()
      }-${tS4()
      }-${tS4()
      }-${tS4()
      }${tS4()
      }${tS4()}`
    )
  }


  /**
   * Both arguments are arrays of corners with x,y attributes
   *
   * @return {boolean}
   */
  static polygonPolygonIntersect(firstCorners, secondCorners) {
    for (let tI = 0; tI < firstCorners.length; tI++) {
      const tFirstCorner = firstCorners[tI]
      let tSecondCorner
      if (tI === firstCorners.length - 1) {
        tSecondCorner = firstCorners[0]
      } else {
        tSecondCorner = firstCorners[tI + 1]
      }
      if (
        Utils.linePolygonIntersect(tFirstCorner, tSecondCorner, secondCorners)
      ) {
        return true
      }
    }
    return false
  }


  /**
   * Corners is an array of points with x,y attributes
   *
   * @return {boolean}
   */
  static linePolygonIntersect(point, point2, corners) {
    for (let tI = 0; tI < corners.length; tI++) {
      const tFirstCorner = corners[tI]
      let tSecondCorner
      if (tI === corners.length - 1) {
        tSecondCorner = corners[0]
      } else {
        tSecondCorner = corners[tI + 1]
      }
      if (Utils.lineLineIntersect(point, point2, tFirstCorner, tSecondCorner)) {
        return true
      }
    }
    return false
  }


  /**
   * @return {Vector2|undefined}
   */
  static lineLineIntersectPoint(aStart, aEnd, bStart, bEnd) {
    const result = checkIntersection(
        aStart.x,
        aStart.y,
        aEnd.x,
        aEnd.y,
        bStart.x,
        bStart.y,
        bEnd.x,
        bEnd.y,
    )
    if (result.point) {
      return new Vector2(result.point.x, result.point.y)
    }
    return undefined
  }


  /**
   * @return {boolean}
   */
  static lineLineIntersect(lineAStart, lineAEnd, lineBStart, lineBEnd) {
    /**
     * @return {number}
     */
    function tCCW(p1, p2, p3) {
      const tA = p1.x
      const tB = p1.y
      const tC = p2.x
      const tD = p2.y
      const tE = p3.x
      const tF = p3.y
      return (tF - tB) * (tC - tA) > (tD - tB) * (tE - tA)
    }
    const tP1 = lineAStart
    const tP2 = lineAEnd
    const tP3 = lineBStart
    const tP4 = lineBEnd
    return (
      tCCW(tP1, tP3, tP4) !== tCCW(tP2, tP3, tP4) &&
      tCCW(tP1, tP2, tP3) !== tCCW(tP1, tP2, tP4)
    )
  }


  /**
   * @param corners Is an array of points with x,y attributes
   * @param startX X start coord for raycast
   * @param startY Y start coord for raycast
   * @return {boolean}
   */
  static pointInPolygon2(point, polygon) {
    const x = point.x
    const y = point.y
    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const intersect =
        ((polygon[i].y <= y && y < polygon[j].y) || (polygon[j].y <= y && y < polygon[i].y)) &&
        x < (((polygon[j].x - polygon[i].x) * (y - polygon[i].y)) / (polygon[j].y - polygon[i].y)) + polygon[i].x
      if (intersect) {
        inside = !inside
      }
    }
    return inside
  }


  /**
   * @param corners Is an array of points with x,y attributes
   * @param startX X start coord for raycast
   * @param startY Y start coord for raycast
   * @return {boolean}
   */
  static pointInPolygon(point, corners, start) {
    start = start || new Vector2(0, 0)
    let startX = start.x || 0
    let startY = start.y || 0

    // Ensure that point(startX, startY) is outside the polygon consists of corners
    let tMinX = 0
    let tMinY = 0
    let tI = 0

    if (startX === undefined || startY === undefined) {
      for (tI = 0; tI < corners.length; tI++) {
        tMinX = Math.min(tMinX, corners[tI].x)
        tMinY = Math.min(tMinX, corners[tI].y)
      }
      startX = tMinX - 10
      startY = tMinY - 10
    }

    let tIntersects = 0
    for (tI = 0; tI < corners.length; tI++) {
      const tFirstCorner = corners[tI]
      let tSecondCorner
      if (tI === corners.length - 1) {
        tSecondCorner = corners[0]
      } else {
        tSecondCorner = corners[tI + 1]
      }
      if (Utils.lineLineIntersect(start, point, tFirstCorner, tSecondCorner)) {
        tIntersects++
      }
    }

    // Odd intersections means the point is in the polygon
    return tIntersects % 2 === 1
  }


  /**
   * Checks if all corners of insideCorners are inside the polygon described by outsideCorners
   *
   * @return {boolean}
   */
  static polygonInsidePolygon(insideCorners, outsideCorners, start) {
    start = start || new Vector2(0, 0)
    for (let tI = 0; tI < insideCorners.length; tI++) {
      if (!Utils.pointInPolygon(insideCorners[tI], outsideCorners, start)) {
        return false
      }
    }
    return true
  }


  /**
   * Checks if any corners of firstCorners is inside the polygon described by secondCorners
   *
   * @return {boolean}
   */
  static polygonOutsidePolygon(insideCorners, outsideCorners, start) {
    start = start || new Vector2(0, 0)
    for (let tI = 0; tI < insideCorners.length; tI++) {
      if (Utils.pointInPolygon2(insideCorners[tI], outsideCorners)) {
        return false
      }
    }
    return true
  }


  /* Arrays */


  /**
   * @param {Array} array
   * @param {Function} action
   */
  static forEach(array, action) {
    for (let tI = 0; tI < array.length; tI++) {
      action(array[tI])
    }
  }


  /**
   * @param {Array} array
   * @param {Function} action
   */
  static forEachIndexed(array, action) {
    for (let tI = 0; tI < array.length; tI++) {
      action(tI, array[tI])
    }
  }


  /**
   * @param {Array} array
   * @param {Function} func
   * @return {Array}
   */
  static map(array, func) {
    const tResult = []
    array.forEach((element) => {
      tResult.push(func(element))
    })
    return tResult
  }


  /**
   * Remove elements in array if func(element) returns true
   *
   * @return {Array}
   */
  static removeIf(array, func) {
    const tResult = []
    array.forEach((element) => {
      if (!func(element)) {
        tResult.push(element)
      }
    })
    return tResult
  }


  /**
   * Shift the items in an array by shift (positive integer)
   *
   * @return {Array}
   */
  static cycle(arr, shift) {
    const tReturn = arr.slice(0)
    for (let tI = 0; tI < shift; tI++) {
      const tmp = tReturn.shift()
      tReturn.push(tmp)
    }
    return tReturn
  }


  /**
   * Returns in the unique elements in arr
   *
   * @return {Array}
   */
  static unique(arr, hashFunc) {
    const tResults = []
    const tMap = {}
    for (let tI = 0; tI < arr.length; tI++) {
      // eslint-disable-next-line no-prototype-builtins
      if (!tMap.hasOwnProperty(arr[tI])) {
        tResults.push(arr[tI])
        tMap[hashFunc(arr[tI])] = true
      }
    }
    return tResults
  }


  /**
   * Remove value from array, if it is present
   */
  static removeValue(array, value) {
    for (let tI = array.length - 1; tI >= 0; tI--) {
      if (array[tI] === value) {
        array.splice(tI, 1)
      }
    }
  }


  /**
   * Checks if value is in array
   *
   * @return {boolean}
   */
  static hasValue(array, value) {
    for (let tI = 0; tI < array.length; tI++) {
      if (array[tI] === value) {
        return true
      }
    }
    return false
  }


  /**
   * Subtracts the elements in subArray from array
   *
   * @return {boolean}
   */
  static subtract(array, subArray) {
    return Utils.removeIf(array, function(el) {
      return Utils.hasValue(subArray, el)
    })
  }
}


/**
 * Region
 */
export class Region {
  /**
   * constructor
   */
  constructor(points) {
    this.points = points || []
    this.length = points.length
  }


  /**
   * @return {number}
   */
  area() {
    let area = 0
    let i
    let j
    let point1
    let point2

    for (i = 0, j = this.length - 1; i < this.length; j = i, i += 1) {
      point1 = this.points[i]
      point2 = this.points[j]
      area += point1.x * point2.y
      area -= point1.y * point2.x
    }
    area *= 0.5

    return area
  }


  /**
   * @return {Vector2}
   */
  centroid() {
    let x = 0
    let y = 0
    let i
    let j
    let f
    let point1
    let point2

    for (i = 0, j = this.length - 1; i < this.length; j = i, i += 1) {
      point1 = this.points[i]
      point2 = this.points[j]
      f = (point1.x * point2.y) - (point2.x * point1.y)
      x += (point1.x + point2.x) * f
      y += (point1.y + point2.y) * f
    }

    f = this.area() * 6

    return new Vector2(x / f, y / f)
  }
}
