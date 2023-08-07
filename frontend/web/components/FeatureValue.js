import React, { Component } from 'react'
import Format from 'common/utils/format'

const FeatureValue = class extends Component {
  static displayName = 'FeatureValue'

  constructor(props, context) {
    super(props, context)
    this.state = {}
  }

  render() {
    if (this.props.value === null || this.props.value === undefined) {
      return null
    }
    const type = typeof this.props.value
    if (
      type === 'string' &&
      this.props.value === '' &&
      !this.props.includeEmpty
    ) {
      return null
    }
    return (
      <span
        className={`chip ${this.props.className || ''}`}
        onClick={this.props.onClick}
        data-test={this.props['data-test']}
      >
        {type == 'string' && <span>"</span>}
        {Format.truncateText(`${this.props.value}`, 16)}
        {type == 'string' && <span>"</span>}
      </span>
    )
  }
}

FeatureValue.propTypes = {}

module.exports = FeatureValue
