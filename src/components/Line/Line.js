import React from 'react'
import PropTypes from 'prop-types'
import styles from './Line.css'

class Line extends React.Component {
  render () {
    if (this.props.chartData) {
      const pathData = this.props.lineFunction(this.props.chartData)
      return <path ref={p => { this.path = p }} d={pathData} className={styles.path} />
    }
    return null
  }
}

Line.propTypes = {
  chartData: PropTypes.array,
  lineFunction: PropTypes.func.isRequired
}

Line.defaultProps = {
  chartData: null
}

export default Line
