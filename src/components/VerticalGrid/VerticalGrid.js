import React from 'react'
import PropTypes from 'prop-types'
import d3 from 'd3'
import styles from './VerticalGrid.css'

class VerticalGrid extends React.Component {
  componentDidMount () {
    d3.select(this.gNode).call(this.props.createAxisFunction(this.props.scaleFunction)
      .tickSize(-this.props.chartHeight, 0, 0)
      .ticks(6)
      .tickFormat('')
    )
  }

  render () {
    const gridStyles = {
      transform: `translate(0, ${this.props.chartHeight}px)`
    }
    return (
      <g ref={g => { this.gNode = g }} className={styles.grid} style={gridStyles} />
    )
  }
}

VerticalGrid.propTypes = {
  chartHeight: PropTypes.number.isRequired,
  createAxisFunction: PropTypes.func.isRequired,
  scaleFunction: PropTypes.func.isRequired
}

export default VerticalGrid
