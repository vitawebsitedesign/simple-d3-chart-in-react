import React from 'react'
import PropTypes from 'prop-types'
import d3 from 'd3'
import styles from './HorizontalGrid.css'

class HorizontalGrid extends React.Component {
  componentDidMount () {
    d3.select(this.gNode).call(this.props.createAxisFunction(this.props.scaleFunction)
      .tickSize(-this.props.chartWidth, 0, 0)
      .tickValues(this.props.tickValues)
      .tickFormat(''))
  }

  render () {
    return (
      <g ref={g => { this.gNode = g }} className={styles.grid} />
    )
  }
}

HorizontalGrid.propTypes = {
  chartWidth: PropTypes.number.isRequired,
  createAxisFunction: PropTypes.func.isRequired,
  scaleFunction: PropTypes.func.isRequired,
  tickValues: PropTypes.array.isRequired
}

export default HorizontalGrid
