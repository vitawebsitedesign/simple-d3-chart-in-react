import d3 from 'd3'
import CoreUtil from '../CoreUtil/CoreUtil'
import CoreConstants from '../CoreConstants/CoreConstants'

class Core {
  static svgG (gNode) {
    return d3.select(gNode)
  }

  static dimensions (container) {
    var parentCtnrDim = this.parentCtnrDimensions(container)

    var svg = {
      w: parentCtnrDim.w,
      h: parentCtnrDim.h,
      margin: CoreConstants.margin
    }
    return {
      svg: svg,
      chart: {
        w: svg.w - svg.margin.left - svg.margin.right,
        h: svg.h - svg.margin.top - svg.margin.bottom
      }
    }
  }

  static parentCtnrDimensions (container) {
    var style = window.getComputedStyle(container, null)
    var padL = parseInt(style.getPropertyValue('padding-left'))
    var padR = parseInt(style.getPropertyValue('padding-right'))
    const padT = parseInt(style.getPropertyValue('padding-top'))
    const padB = parseInt(style.getPropertyValue('padding-bottom'))
    const parentBoundingClientRect = container.parentElement.getBoundingClientRect()
    return {
      h: parentBoundingClientRect.height - padT - padB,
      w: parentBoundingClientRect.width - padL - padR // Parent, width minus <user-threshold/> element padding (which may be added by bootstrap)
    }
  }

  static scales (dim) {
    return {
      x: d3.scale.linear().range([0, dim.chart.w]),
      yLeft: d3.scale.linear().range([dim.chart.h, 0]),
      yRight: d3.scale.linear().range([dim.chart.h, 0])
    }
  }

  static axesInfo (data, scales) {
    return {
      x: CoreUtil.xAxesInfo(data),  // Extract x axis info (date min and max)
      y: CoreUtil.yAxesInfo(data, scales) // Extract y axis info (meas min and max)
    }
  }

  static getYLTickVals (chartData) {
    var atLeastOneMeas = (chartData && chartData[0] && chartData[0][0])
    if (!atLeastOneMeas) {
      return CoreConstants.yLTicksVals
    }

    // Get measurements for left y-axis
    var leftYAxisMeasurements = chartData

    // Get non-padded range based on patient measurements
    var measMin = d3.min(leftYAxisMeasurements, function (d) {
      return d.value
    })
    var measMax = d3.max(leftYAxisMeasurements, function (d) {
      return d.value
    })

    // Get padded range based on patient measurements
    var padding = CoreConstants.verticalYAxisPadding
    const paddingMultiplier = 1 + padding
    var measMinWithPadding = measMin * paddingMultiplier
    var measMaxWithPadding = measMax * paddingMultiplier

    // Get padded range
    var min = measMinWithPadding
    var max = measMaxWithPadding

    return CoreUtil.tickValsForYAxis(CoreConstants.yAxisLeftTickNum, min, max)
  }

  static domains (scales, yLTickVals) {
    var info = CoreUtil.domainInfo(yLTickVals)
    scales.x.domain([info.x.earliest, info.x.latest])
    scales.yLeft.domain([info.yL.lower, info.yL.upper])
    scales.yRight.domain([info.yR.lower, info.yR.upper])

    return {
      x: scales.x.domain(),
      yL: scales.yLeft.domain(),
      yR: scales.yRight.domain()
    }
  }

  static getAxes (scales, yLTickVals) {
    var xTicks = 0

    var x = d3.svg.axis().scale(scales.x)
      .orient('bottom')
      .ticks(xTicks)
    var yL = d3.svg.axis().scale(scales.yLeft)
      .orient('left')
      .tickValues(yLTickVals)
      .tickFormat('') // Dont show left-Y axis labels on live measurement chart

    var yR = d3.svg.axis().scale(scales.yRight)
      .orient('right')
      .ticks(CoreConstants.yAxisRightTickNum)

    return {
      x: x,
      yL: yL,
      yR: yR
    }
  }

  static lineFns (scales) {
    var xForDate = function (d) {
      var coord = scales.x(new Date(d.dateAcquired))
      // Fail gracefully if a calculated coordinate for a point is invalid.
      // -1 for traceability
      if (isNaN(coord)) {
        return -1
      }
      return coord
    }

    const thisScales = scales

    var yForNum = function (d) {
      if (d && thisScales.yLeft) {
        var coord = thisScales.yLeft(d.value)
        // Fail gracefully if a calculated coordinate for a point is invalid.
        // -1 for traceability
        var validCoord = !isNaN(coord)
        if (validCoord) {
          return coord
        }
      }

      return -1
    }

    var l = d3.svg.line().x(function (d) {
      return scales.x(new Date(d.dateAcquired))
    }).y(yForNum)

    var r = d3.svg.line().x(function (d) {
      return scales.x(new Date(d.dateAcquired))
    }).y(yForNum)

    return {
      xForDate: xForDate,
      yForNum: yForNum,
      l: l,
      r: r
    }
  }

  static chartData (chartData, scales) {
    if (chartData) {
      for (var s = 0; s < chartData.length; s++) {
        CoreUtil.setScalesForMeasPts(chartData, scales)
      }
    }
    return chartData
  }

  static createXAxis (x) {
    return d3.svg.axis().scale(x).orient('bottom')
  }

  static createYAxis (yLeft) {
    return d3.svg.axis().scale(yLeft).orient('left')
  }

  static rollingWindow (data) {
    var dataPts = data.length
    var maxDataPtsInWindow = CoreConstants.numBlocks
    var start = Math.max(0, dataPts - maxDataPtsInWindow)
    var end = start + maxDataPtsInWindow
    var dataWindow = data.slice(start, end)

    for (var d = 0; d < dataWindow.length; d++) {
      dataWindow[d].dateAcquired = d
    }
    return dataWindow
  }
}

export default Core
