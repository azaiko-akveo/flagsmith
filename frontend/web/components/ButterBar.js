import React, { Component } from 'react'
import ConfigProvider from 'common/providers/ConfigProvider'
import ProjectStore from 'common/stores/project-store'
import ReactMarkdown from 'react-markdown'

class ButterBar extends Component {
  static contextTypes = {
    router: propTypes.object.isRequired,
  }

  constructor(props) {
    super(props)
    ES6Component(this)
  }

  render() {
    const matches = document.location.href.match(/\/environment\/([^/]*)/)
    const environment = matches && matches[1]
    if (environment) {
      const environmentDetail = ProjectStore.getEnvironment(environment)
      if (environmentDetail && environmentDetail.banner_text) {
        return (
          <div
            className='butter-bar font-weight-medium'
            style={{
              backgroundColor: environmentDetail.banner_colour,
              color: 'white',
            }}
          >
            {environmentDetail.banner_text}
          </div>
        )
      }
    }
    return (
      <>
        {Utils.getFlagsmithValue('butter_bar') &&
          !Utils.getFlagsmithHasFeature('read_only_mode') && (
            <ReactMarkdown className='butter-bar'>
              {Utils.getFlagsmithValue('butter_bar')}
            </ReactMarkdown>
          )}
        {Utils.getFlagsmithHasFeature('read_only_mode') && (
          <div className='butter-bar'>
            Your organisation is over its usage limit, please{' '}
            <Link to='/organisation-settings'>upgrade your plan</Link>.
          </div>
        )}
      </>
    )
  }
}

export default ConfigProvider(ButterBar)
