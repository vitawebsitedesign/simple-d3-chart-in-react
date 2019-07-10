import React from 'react'
import PropTypes from 'prop-types'
import d3 from 'd3'
import styles from './YAxis.css'

class YAxis extends React.Component {
  componentDidMount () {
    d3.select(this.gNode).call(this.props.axisFunction)
  }

  render () {
    return (
      <g ref={g => { this.gNode = g }} className={styles.yAxis} />
    )
  }
}

YAxis.propTypes = {
  axisFunction: PropTypes.func.isRequired
}

export default YAxis
