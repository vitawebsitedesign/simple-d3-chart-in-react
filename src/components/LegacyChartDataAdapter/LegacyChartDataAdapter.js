import React from 'react'

class LegacyChartDataAdapter extends React.Component {
  static adapt (allSeries) {
    allSeries = allSeries.map(series =>
      series.map((meas, index) =>
        this.adaptMeas(meas, index)
      )
    )
    return allSeries
  }

  static adaptMeas (measValue, index) {
    return {
      dateAcquired: index,
      value: measValue,
      clinicalDataType: {
        value: ''
      },
      unitType: {
        value: ''
      }
    }
  }

  static getInitialChartData (partialChartData) {
    const allSeries = this.putDataInLegacyStructure(partialChartData)
    return this.adapt(allSeries)
  }

  static putDataInLegacyStructure (data) {
    return [
      [
        ...data
      ]
    ]
  }

  render () {
    return <span />
  }
}

export default LegacyChartDataAdapter
