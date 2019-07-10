import React from 'react'
import PropTypes from 'prop-types'
import styles from './MichaelChart.css'
import Core from '../Core/Core'
import XAxis from '../XAxis/XAxis'
import YAxis from '../YAxis/YAxis'
import VerticalGrid from '../VerticalGrid/VerticalGrid'
import HorizontalGrid from '../HorizontalGrid/HorizontalGrid'
import Line from '../Line/Line'
import LegacyChartDataAdapter from '../LegacyChartDataAdapter/LegacyChartDataAdapter'

class MichaelChart extends React.Component {
  constructor (props) {
    super(props)
    this.update = this.update.bind(this)

    this.state = {
      chartData: null,
      fakeEcgCounter: 0
    }
  }

  componentDidMount () {
    this.meta = this.metadata()
    this.setSizeAndPos()
  }

  metadata () {
    var svg = this.svg
    var svgG = Core.svgG(this.svgGNode)
    var dim = Core.dimensions(this.container)
    var scales = Core.scales(dim)
    var yLTickVals = Core.getYLTickVals(this.state.chartData)
    var domains = Core.domains(scales, yLTickVals)
    var axes = Core.getAxes(scales, yLTickVals)
    var lineFns = Core.lineFns(scales)
    var data = Core.chartData(this.state.chartData, scales)
    var thresh = null
    var dots = false

    return {
      dim: dim,
      svg: svg,
      svgG: svgG,
      scales: scales,
      yLTickVals: yLTickVals,
      domains: domains,
      axes: axes,
      lineFns: lineFns,
      data: data,
      thresh: thresh,
      dots: dots,
      liveMeas: true
    }
  }

  setSizeAndPos () {
    var m = this.meta
    m.svg.setAttribute('width', m.dim.svg.w)
    m.svg.setAttribute('height', m.dim.svg.h)
    m.svgG.style.transform = 'translate(' + m.dim.svg.margin.left + 'px ,' + m.dim.svg.margin.top + 'px)'  // FF & chrome
    m.svgG.attr('transform', 'translate(' + m.dim.svg.margin.left + ' ' + m.dim.svg.margin.top + ')')  // IE
  }

  update () {
    let newChartData = this.clone(this.state.chartData)
    if (!newChartData) {
      newChartData = LegacyChartDataAdapter.getInitialChartData(this.props.partialChartData)
    } else {
      newChartData = this.appendPartialChartData(newChartData, this.props.partialChartData)
    }

    const dataInWindow = Core.rollingWindow(newChartData[0])
    newChartData = LegacyChartDataAdapter.putDataInLegacyStructure(dataInWindow)

    this.setState(() => ({
      chartData: newChartData
    }))
  }

  appendPartialChartData (newChartData, partialChartData) {
    const numMeasAlreadyInChartData = newChartData[0].length
    const legacyPartialChartData = partialChartData.map((val, index) => {
      const newIndex = numMeasAlreadyInChartData + index
      return LegacyChartDataAdapter.adaptMeas(val, newIndex)
    })

    const joinedData = newChartData[0].concat(legacyPartialChartData)
    newChartData[0] = joinedData
    return newChartData
  }

  hasData () {
    return this.state.chartData && this.state.chartData[0] && this.state.chartData[0][0]
  }

  clone (obj) {
    return JSON.parse(JSON.stringify(obj))
  }

  render () {
    let xAxis = null
    let yAxis = null
    let verticalGrid = null
    let horizontalGrid = null
    let line = null

    const m = this.meta

    if (m && m.dim.chart.h && m.axes.x) {
      const chartHeight = m.dim.chart.h
      const chartWidth = m.dim.chart.w
      const tickValues = m.yLTickVals
      const chartData = (this.state.chartData ? this.state.chartData[0] : this.state.chartData)
      const lineFunction = m.lineFns.l

      xAxis = <XAxis axisFunction={m.axes.x} chartHeight={chartHeight} />
      yAxis = <YAxis axisFunction={m.axes.yL} />
      verticalGrid = <VerticalGrid chartHeight={chartHeight} createAxisFunction={Core.createXAxis} scaleFunction={m.scales.x} />
      horizontalGrid = <HorizontalGrid chartWidth={chartWidth} createAxisFunction={Core.createYAxis} scaleFunction={m.scales.yLeft} tickValues={tickValues} />
      line = <Line ref={line => { this.line = line }} chartData={chartData} lineFunction={lineFunction} />
    }

    return (
      <div ref={c => { this.container = c }} className={styles.container}>
        <svg ref={s => { this.svg = s }} title='chart' version='1.1' xmlns='http://www.w3.org/2000/svg' height='0' width='0'>
          <g ref={g => { this.svgGNode = g }} className='chart-contents' />

          {verticalGrid}
          {horizontalGrid}
          {xAxis}
          {yAxis}
          {line}
        </svg>
      </div>
    )
  }
}

MichaelChart.propTypes = {
  partialChartData: PropTypes.any
}

MichaelChart.defaultProps = {
  partialChartData: null
}

export default MichaelChart
