// import propTypes from 'prop-types';
import React, { PureComponent } from 'react'
import ValueEditor from './ValueEditor'
import Constants from 'common/constants'
import VariationOptions from './mv/VariationOptions'
import AddVariationButton from './mv/AddVariationButton'
import ErrorMessage from './ErrorMessage'

export default class Feature extends PureComponent {
  static displayName = 'Feature'

  removeVariation = (i) => {
    const idToRemove = this.props.multivariate_options[i].id

    if (idToRemove) {
      openConfirm(
        'Please confirm',
        'This will remove the variation on your feature for all environments, if you wish to turn it off just for this environment you can set the % value to 0.',
        () => {
          this.props.removeVariation(i)
        },
      )
    } else {
      this.props.removeVariation(i)
    }
  }

  render() {
    const {
      checked,
      environmentFlag,
      environmentVariations,
      error,
      hide_from_client,
      identity,
      isEdit,
      multivariate_options,
      onCheckedChange,
      onValueChange,
      projectFlag,
      readOnly,
      value,
    } = this.props

    const enabledString = isEdit ? 'Enabled' : 'Enabled by default'
    const disabled = hide_from_client
    const controlValue = Utils.calculateControl(multivariate_options)
    const valueString = identity
      ? 'User override'
      : !!multivariate_options && multivariate_options.length
      ? `Control Value - ${controlValue}%`
      : `Value (optional)${' - these can be set per environment'}`

    const showValue = !(
      !!identity &&
      multivariate_options &&
      !!multivariate_options.length
    )
    return (
      <div>
        <FormGroup className='mb-4 flex-row'>
          <Switch
            data-test='toggle-feature-button'
            defaultChecked={checked}
            disabled={disabled || readOnly}
            checked={!disabled && checked}
            onChange={onCheckedChange}
            className='ml-0'
          />
          <div className='label-switch ml-3'>{enabledString || 'Enabled'}</div>
        </FormGroup>

        {showValue && (
          <FormGroup className='mb-4'>
            <InputGroup
              component={
                <ValueEditor
                  data-test='featureValue'
                  name='featureValue'
                  className='full-width'
                  value={`${
                    typeof value === 'undefined' || value === null ? '' : value
                  }`}
                  onChange={onValueChange}
                  disabled={hide_from_client || readOnly}
                  placeholder="e.g. 'big' "
                />
              }
              tooltip={Constants.strings.REMOTE_CONFIG_DESCRIPTION}
              title={`${valueString}`}
            />
          </FormGroup>
        )}

        {!!error && (
          <div className='mx-2 mt-2'>
            <ErrorMessage error={error} />
          </div>
        )}
        {!!identity && (
          <div>
            <FormGroup className='mb-4'>
              <VariationOptions
                disabled
                select
                controlValue={environmentFlag.feature_state_value}
                variationOverrides={this.props.identityVariations}
                setVariations={this.props.onChangeIdentityVariations}
                updateVariation={() => {}}
                weightTitle='Override Weight %'
                projectFlag={projectFlag}
                multivariateOptions={projectFlag.multivariate_options}
                removeVariation={() => {}}
              />
            </FormGroup>
          </div>
        )}
        {!identity && (
          <div>
            <FormGroup className='mb-0'>
              {(!!environmentVariations || !isEdit) && (
                <VariationOptions
                  disabled={!!identity || readOnly}
                  controlValue={controlValue}
                  variationOverrides={environmentVariations}
                  updateVariation={this.props.updateVariation}
                  weightTitle={
                    isEdit ? 'Environment Weight %' : 'Default Weight %'
                  }
                  multivariateOptions={multivariate_options}
                  removeVariation={this.removeVariation}
                />
              )}
            </FormGroup>
            {!this.props.hideAddVariation &&
              Utils.renderWithPermission(
                this.props.canCreateFeature,
                Constants.projectPermissions('Create Feature'),
                <AddVariationButton
                  disabled={!this.props.canCreateFeature || readOnly}
                  onClick={this.props.addVariation}
                />,
              )}
          </div>
        )}
      </div>
    )
  }
}
