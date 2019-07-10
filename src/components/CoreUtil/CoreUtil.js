import d3 from 'd3'
import CoreConstants from '../CoreConstants/CoreConstants'

class CoreUtil {
  static xAxesInfo (data) {
    var firstMeasDateAcq = new Date(data[0][0].dateAcquired)
    var xAxisInfo = {
      earliest: firstMeasDateAcq,
      latest: firstMeasDateAcq
    }

    var meas = this.measFromAllSeries(data)
    for (var m = 0; m < meas.length; m++) {
      var dateAcq = new Date(meas[m].dateAcquired)
      if (dateAcq < xAxisInfo.earliest) {
        xAxisInfo.earliest = dateAcq
      }
      if (dateAcq > xAxisInfo.latest) {
        xAxisInfo.latest = dateAcq
      }
    }

    return xAxisInfo
  }

  static yAxesInfo (data, scales) {
    var yAxes = []
    // For each series
    for (var s = 0; s < data.length; s++) {
      // Get x axis info (record earliest and latest dates)
      var series = data[s]
      var ai = this.axesIndexForUnit(series[0].unitType.value.trim(), yAxes)
      var yAxisInfoForSeries = this.yAxisInfoForSeries(series, scales, ai, yAxes.length)

      // If min and max has already been set for this series' units
      if (ai !== -1) {
        // Update min and max
        yAxes[ai].min = Math.min(yAxes[ai].min, yAxisInfoForSeries.min)
        yAxes[ai].max = Math.max(yAxes[ai].max, yAxisInfoForSeries.max)
      }
      yAxes.push(yAxisInfoForSeries)
    }

    return yAxes
  }

  static measFromAllSeries (series) {
    var meas = []
    for (var s = 0; s < series.length; s++) {
      meas = meas.concat(series[s])
    }
    return meas
  }

  static axesIndexForUnit (unit, axes) {
    var axesUnits = {}
    for (var a = 0; a < axes.length; a++) {
      axesUnits[axes[a].unit] = null
    }
    return Object.keys(axesUnits).indexOf(unit)
  }

  static yAxisInfoForSeries (series, scales, axesIndexForUnit, numOfYAxesRecorded) {
    var meas = series[0]
    return {
      'series': meas.clinicalDataType.value,
      'unit': series[0].unitType.value.trim(),
      'scale': this.scaleForUnit(axesIndexForUnit, numOfYAxesRecorded, scales),
      'min': d3.min(series, function (m) {
        return m.value
      }),
      'max': d3.max(series, function (m) {
        return m.value
      })
    }
  }

  static scaleForUnit (axesIndexForUnit, numOfYAxesRecorded, scales) {
    if (numOfYAxesRecorded === 0) {
      return scales.yLeft
    }
    var axesIndexScaleMap = {
      0: scales.yLeft,
      1: scales.yRight
    }
    return axesIndexScaleMap[axesIndexForUnit] || scales.yRight
  }

  static getMeasurementsForLeftYAxis (chartData) {
    var measurements = []
    var axesIndexForLeftYAxis = 0

    for (var s = 0; s < chartData.length; s++) {
      var seriesMeasurements = chartData[s]
      var firstMeas = seriesMeasurements[0]
      if (!firstMeas) {
        continue
      }

      var axesIndexForSeries = 0
      var seriesIsForLeftYAxis = (axesIndexForSeries === axesIndexForLeftYAxis)
      if (seriesIsForLeftYAxis) {
        measurements = measurements.concat(seriesMeasurements)
      }
    }

    return measurements
  }

  static tickValsForYAxis (tickNum, min, max) {
    // Set ticks = array with  lowest num in range
    var ticks = [min]
    // For (tickNum - 1) number of times
    var inputDomainRange = max - min
    for (var tIndex = 1; tIndex < tickNum; tIndex++) {
      // Add (max / (tickNum - 1)) * tickItr, to ticks array
      var tick = min + (inputDomainRange / (tickNum - 1)) * tIndex  // Whilst this math can result in decimal numbers with lots of decimal places, d3js uses the precision to set the Y position of ticks (and only shows rounded integers on the Y axis ticks itself)
      ticks.push(tick)
    }
    // Return ticks
    return ticks
  }

  static domainInfo (yLTickVals) {
    var x = {
      earliest: 0,
      latest: CoreConstants.numBlocks
    }

    var yL = {
      lower: d3.min(yLTickVals),
      upper: d3.max(yLTickVals)
    }
    var yR = {}

    return {
      x: x,
      yL: yL,
      yR: yR
    }
  }

  static rightAxesIndex (yAxes) {
    // For ea series
    for (var s = 0; s < yAxes.length; s++) {
      // If axesIndex indicates that this series is for right axis
      var seriesIsForRightAxis = (this.axesIndexForUnit(yAxes[s].unit, yAxes) === 1)
      if (seriesIsForRightAxis) {
        // Return true
        return s
      }
    }
    // Return false
    return null
  }

  static setScalesForMeasPts (chartData, scales) {
    // For each series
    for (var s = 0; s < chartData.length; s++) {
      // For each measurement
      for (var m = 0; m < chartData[s].length; m++) {
        // Set scale
        var axesIndex = 0
        if (axesIndex === 0) {
          chartData[s][m].scale = scales.yLeft
        } else if (axesIndex === 1) {
          chartData[s][m].scale = scales.yRight
        } else {
          console.error('setScalesForMeasPts(): Failed to determine if a data point belonged to a left or right axis')
        }
      }
    }
  }

  static hasRightAxis (yAxes) {
    return this.rightAxesIndex(yAxes)
  }

  static pathClasses (series) {
    const seriesName = CoreConstants.seriesNameTemplate.replace(CoreConstants.seriesNameNumber, series)
    return `${CoreConstants.seriesGeneric} ${seriesName}`
  }

  static getYAxisLeftTickNum () {
    return CoreConstants.yAxisLeftTickNum
  }
}

export default CoreUtil
