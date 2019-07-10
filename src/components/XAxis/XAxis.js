import React from 'react'
import PropTypes from 'prop-types'
import d3 from 'd3'
import styles from './XAxis.css'

class XAxis extends React.Component {
  componentDidMount () {
    d3.select(this.gNode).call(this.props.axisFunction)
  }

  render () {
    const axisStyles = {
      transform: `translate(0, ${this.props.chartHeight}px)`
    }

    return (
      <g
        ref={g => { this.gNode = g }}
        className={styles.xAxis}
        style={axisStyles}
      />
    )
  }
}

XAxis.propTypes = {
  chartHeight: PropTypes.number.isRequired,
  axisFunction: PropTypes.func.isRequired
}

export default XAxis
