import React, { Component } from 'react'
import propTypes from 'prop-types'
import NavLink from 'react-router-dom/NavLink'
import ProjectSelect from './ProjectSelect'
import AsideProjectButton from './AsideProjectButton'
import AsideTitleLink from './AsideTitleLink'
import Collapsible from './Collapsible'
import ProjectSettingsIcon from './svg/ProjectSettingsIcon'
import AuditLogIcon from './svg/AuditLogIcon'
import OrgSettingsIcon from './svg/OrgSettingsIcon'
import EnvironmentDropdown from './EnvironmentDropdown'
import CreateProjectModal from './modals/CreateProject'
import UserSettingsIcon from './svg/UserSettingsIcon'
import DocumentationIcon from './svg/DocumentationIcon'
import NavIconSmall from './svg/NavIconSmall'
import PlusIcon from './svg/PlusIcon'
import FeaturesIcon from './svg/FeaturesIcon'
import UsersIcon from './svg/UsersIcon'
import SegmentsIcon from './svg/SegmentsIcon'
import EnvironmentSettingsIcon from './svg/EnvironmentSettingsIcon'
import ProjectStore from 'common/stores/project-store'
import ChangeRequestStore from 'common/stores/change-requests-store'
import getBuildVersion from 'project/getBuildVersion'
import ConfigProvider from 'common/providers/ConfigProvider'
import Permission from 'common/providers/Permission'

const Aside = class extends Component {
  static displayName = 'Aside'

  static contextTypes = {
    router: propTypes.object.isRequired,
  }

  static propTypes = {
    asideIsVisible: propTypes.bool,
    className: propTypes.string,
    toggleAside: propTypes.func,
  }

  constructor(props, context) {
    super(props, context)
    this.state = {}
    ES6Component(this)
    AppActions.getProject(this.props.projectId)
    if (this.props.environmentId && this.props.environmentId !== 'create') {
      AppActions.getChangeRequests(this.props.environmentId, {})
    }
    this.listenTo(ChangeRequestStore, 'change', () => this.forceUpdate())
    this.listenTo(ProjectStore, 'loaded', () => {
      const environment = ProjectStore.getEnvironment(this.props.environmentId)
      if (environment) {
        AppActions.getChangeRequests(
          this.props.environmentId,
          Utils.changeRequestsEnabled(
            environment.minimum_change_request_approvals,
          )
            ? {}
            : { live_from_after: new Date().toISOString() },
        )
      }
    })
  }

  componentDidMount() {
    getBuildVersion().then((version) => {
      this.setState({ version })
    })
  }

  componentDidUpdate(prevProps) {
    const environment = ProjectStore.getEnvironment(this.props.environmentId)
    if (this.props.projectId !== prevProps.projectId) {
      AppActions.getProject(prevProps.projectId)
    }
    if (this.props.environmentId !== prevProps.environmentId) {
      if (environment) {
        AppActions.getChangeRequests(
          this.props.environmentId,
          Utils.changeRequestsEnabled(
            environment.minimum_change_request_approvals,
          )
            ? {}
            : { live_from_after: new Date().toISOString() },
        )
      }
    }
  }

  onProjectSave = () => {
    AppActions.refreshOrganisation()
  }

  newProject = () => {
    openModal(
      'Create Project',
      <CreateProjectModal
        onSave={({ environmentId, projectId }) => {
          AppActions.getProject(projectId)
          this.context.router.history.push(
            `/project/${projectId}/environment/${environmentId}/features?new=true`,
          )
        }}
      />,
      'side-modal',
    )
  }

  render() {
    const { asideIsVisible, toggleAside } = this.props
    let integrations = Utils.getFlagsmithValue('integrations') || '[]'
    integrations = JSON.parse(integrations)
    const environmentId =
      (this.props.environmentId !== 'create' && this.props.environmentId) ||
      (ProjectStore.model &&
        ProjectStore.model.environments[0] &&
        ProjectStore.model.environments[0].api_key)
    const environment = ProjectStore.getEnvironment(this.props.environmentId)
    const hasRbacPermission = Utils.getPlansPermission('AUDIT')
    const changeRequest =
      environment &&
      Utils.changeRequestsEnabled(environment.minimum_change_request_approvals)
        ? ChangeRequestStore.model[this.props.environmentId]
        : null
    const changeRequests = changeRequest?.count || 0
    const scheduled =
      (environment &&
        ChangeRequestStore.scheduled[this.props.environmentId]?.count) ||
      0
    return (
      <OrganisationProvider>
        {() => (
          <ProjectProvider
            id={this.props.projectId}
            onSave={this.onProjectSave}
          >
            {({ project }) => (
              <React.Fragment>
                <div
                  className={`aside ${this.props.className || ''}`}
                  style={
                    !asideIsVisible
                      ? {
                          overflow: 'hidden',
                          width: 0,
                        }
                      : isMobile
                      ? {}
                      : {}
                  }
                >
                  {isMobile && (
                    <div
                      role='button'
                      className='clickable toggle'
                      onClick={toggleAside}
                    >
                      {!asideIsVisible ? (
                        <span className='icon ion-md-menu' />
                      ) : (
                        <span className='icon ion-md-close' />
                      )}
                    </div>
                  )}
                  <div className='row ml-0 mr-0 aside__wrapper'>
                    <div
                      className={`aside__projects-sidebar ${
                        this.props.className || ''
                      }`}
                    >
                      <div className='flex-row justify-content-center'>
                        <div className='flex-column'>
                          <Link to='/projects'>
                            <NavIconSmall className='aside__logo' />
                          </Link>
                        </div>

                        <div className='flex-column'>
                          <div className='aside__projects-item'>
                            <div className='flex-row justify-content-center'>
                              <div className='flex-column mb-3'>
                                <Tooltip
                                  title={
                                    <Button
                                      onClick={this.newProject}
                                      className='btn--transparent aside__add-btn'
                                    >
                                      <a id='create-project-link'>
                                        <PlusIcon width={18} />
                                      </a>
                                    </Button>
                                  }
                                  place='right'
                                >
                                  Create Project
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        </div>

                        <ProjectSelect
                          renderRow={(project, onClick) => (
                            <AsideProjectButton
                              data-test={`switch-project-${project.name.toLowerCase()}${
                                this.props.projectId === `${project.id}`
                                  ? '-active'
                                  : ''
                              }`}
                              key={project.id}
                              onClick={onClick}
                              className={
                                this.props.projectId === `${project.id}`
                                  ? 'active'
                                  : ''
                              }
                              name={project.name}
                              projectLetter={`${project.name[0]}`.toUpperCase()}
                            />
                          )}
                          projectId={this.props.projectId}
                          environmentId={environmentId}
                          clearableValue={false}
                          onChange={(project) => {
                            AppActions.getProject(project.id)
                            if (project.environments[0]) {
                              this.context.router.history.push(
                                `/project/${project.id}/environment/${project.environments[0].api_key}/features`,
                              )
                            } else {
                              this.context.router.history.push(
                                `/project/${project.id}/environment/create`,
                              )
                            }
                            AsyncStorage.setItem(
                              'lastEnv',
                              JSON.stringify({
                                environmentId: project.environments[0].api_key,
                                orgId: AccountStore.getOrganisation().id,
                                projectId: project.id,
                              }),
                            )
                          }}
                        />
                      </div>
                    </div>
                    {
                      <React.Fragment>
                        <div className='aside__main-content px-0'>
                          <div className='pl-4 pr-4 pt-4'>
                            <Row>
                              <h1 className='aside__project-title'>
                                {project && project.name ? project.name : '...'}
                              </h1>
                              {Utils.getFlagsmithHasFeature(
                                'edge_identities',
                              ) && (
                                <div className='text-center'>
                                  <span
                                    style={{
                                      border: 'none',
                                      bottom: 2,
                                      left: 5,
                                      position: 'relative',
                                    }}
                                    className='chip chip--active bg-secondary'
                                  >
                                    <a
                                      data-test={
                                        Utils.getIsEdge()
                                          ? 'edge-project'
                                          : 'core-project'
                                      }
                                      href='https://docs.flagsmith.com/advanced-use/edge-api#enabling-the-edge-api'
                                      className='text-white font-weight-bold'
                                    >
                                      {Utils.getIsEdge() ? (
                                        'Edge'
                                      ) : Utils.isMigrating() ? (
                                        <Tooltip title='Migrating to Edge'>
                                          Depending on the amount of project
                                          data, migrating can take a while.
                                          Refresh the page to track progress.
                                        </Tooltip>
                                      ) : (
                                        'Core'
                                      )}
                                    </a>
                                  </span>
                                </div>
                              )}
                            </Row>
                          </div>
                          <Permission
                            level='project'
                            permission='ADMIN'
                            id={this.props.projectId}
                          >
                            {({ permission }) =>
                              permission && (
                                <NavLink
                                  id='project-settings-link'
                                  activeClassName='active'
                                  className='aside__nav-item mt-4'
                                  to={`/project/${this.props.projectId}/settings`}
                                >
                                  <ProjectSettingsIcon className='aside__nav-item--icon' />
                                  Project Settings
                                </NavLink>
                              )
                            }
                          </Permission>

                          <NavLink
                            to={`/project/${project.id}/environment/${environmentId}/segments`}
                            id='segments-link'
                            className='aside__nav-item'
                          >
                            <SegmentsIcon className='aside__nav-item--icon' />
                            Segments
                          </NavLink>
                          <NavLink
                            id='integrations-link'
                            activeClassName='active'
                            className='aside__nav-item'
                            to={`/project/${project.id}/environment/${environmentId}/compare`}
                            exact
                          >
                            <span className='icon ion-md-git-pull-request aside__nav-item--icon' />
                            Compare
                          </NavLink>

                          <Permission
                            level='project'
                            permission='VIEW_AUDIT_LOG'
                            id={this.props.projectId}
                          >
                            {({ permission }) =>
                              permission &&
                              hasRbacPermission && (
                                <NavLink
                                  id='audit-log-link'
                                  activeClassName='active'
                                  className='aside__nav-item'
                                  to={`/project/${this.props.projectId}/environment/${environmentId}/audit-log`}
                                >
                                  <AuditLogIcon className='aside__nav-item--icon' />
                                  Audit Log
                                </NavLink>
                              )
                            }
                          </Permission>

                          {!hasRbacPermission && (
                            <Tooltip
                              title={
                                <a
                                  href='#'
                                  className='aside__nav-item disabled'
                                >
                                  <AuditLogIcon className='aside__nav-item--icon' />
                                  Audit Log
                                </a>
                              }
                            >
                              This feature is available with our scaleup plan
                            </Tooltip>
                          )}
                          {!!integrations.length && (
                            <Permission
                              level='project'
                              permission='CREATE_ENVIRONMENT'
                              id={this.props.projectId}
                            >
                              {({ permission }) =>
                                permission && (
                                  <NavLink
                                    id='integrations-link'
                                    activeClassName='active'
                                    className='aside__nav-item'
                                    to={`/project/${this.props.projectId}/integrations`}
                                    exact
                                  >
                                    <i className='icon mr-2 ion-ios-apps aside__nav-item--icon' />
                                    Integrations
                                  </NavLink>
                                )
                              }
                            </Permission>
                          )}
                          <Permission
                            level='project'
                            permission='CREATE_ENVIRONMENT'
                            id={this.props.projectId}
                          >
                            {({ permission }) =>
                              permission && (
                                <NavLink
                                  id='create-env-link'
                                  className='aside__header-link'
                                  to={`/project/${this.props.projectId}/environment/create`}
                                  exact
                                >
                                  <AsideTitleLink
                                    tooltip='Create Environment'
                                    className='mt-4'
                                    title='Environments'
                                    iconClassName='ion-md-add'
                                  />
                                </NavLink>
                              )
                            }
                          </Permission>

                          {
                            <div className='aside__environments-wrapper'>
                              <EnvironmentDropdown
                                renderRow={(environment, onClick) => (
                                  <Collapsible
                                    data-test={`switch-environment-${environment.name.toLowerCase()}${
                                      environmentId === `${environment.api_key}`
                                        ? '-active'
                                        : ''
                                    }`}
                                    onClick={onClick}
                                    active={
                                      environment.api_key === environmentId
                                    }
                                    title={environment.name}
                                  >
                                    <Permission
                                      level='environment'
                                      permission={Utils.getViewIdentitiesPermission()}
                                      id={environment.api_key}
                                    >
                                      {({
                                        isLoading: manageIdentityLoading,
                                        permission: manageIdentityPermission,
                                      }) => (
                                        <Permission
                                          level='environment'
                                          permission='ADMIN'
                                          id={environment.api_key}
                                        >
                                          {({
                                            isLoading,
                                            permission: environmentAdmin,
                                          }) =>
                                            isLoading ||
                                            manageIdentityLoading ? (
                                              <div className='text-center'>
                                                <Loader />
                                              </div>
                                            ) : (
                                              <div className='aside__environment-nav list-unstyled mb-0'>
                                                <NavLink
                                                  className='aside__environment-list-item'
                                                  id='features-link'
                                                  to={`/project/${project.id}/environment/${environment.api_key}/features`}
                                                >
                                                  <FeaturesIcon className='aside__environment-list-item--icon' />
                                                  Features
                                                </NavLink>
                                                <NavLink
                                                  activeClassName='active'
                                                  className='aside__environment-list-item'
                                                  id='change-requests-link'
                                                  to={`/project/${project.id}/environment/${environment.api_key}/scheduled-changes/`}
                                                >
                                                  <span className='ion icon ion-ios-timer aside__environment-list-item--icon' />
                                                  Scheduling
                                                  {scheduled ? (
                                                    <span className='ml-1 unread'>
                                                      {scheduled}
                                                    </span>
                                                  ) : null}
                                                </NavLink>
                                                <NavLink
                                                  activeClassName='active'
                                                  className='aside__environment-list-item'
                                                  id='change-requests-link'
                                                  to={`/project/${project.id}/environment/${environment.api_key}/change-requests/`}
                                                >
                                                  <span className='ion icon ion-md-git-pull-request aside__environment-list-item--icon' />
                                                  Change Requests{' '}
                                                  {changeRequests ? (
                                                    <span className='unread'>
                                                      {changeRequests}
                                                    </span>
                                                  ) : null}
                                                </NavLink>
                                                {manageIdentityPermission && (
                                                  <NavLink
                                                    id='users-link'
                                                    className='aside__environment-list-item'
                                                    exact
                                                    to={`/project/${project.id}/environment/${environment.api_key}/users`}
                                                  >
                                                    <UsersIcon className='aside__environment-list-item--icon' />
                                                    Identities
                                                  </NavLink>
                                                )}

                                                {environmentAdmin && (
                                                  <NavLink
                                                    id='env-settings-link'
                                                    className='aside__environment-list-item'
                                                    to={`/project/${project.id}/environment/${environment.api_key}/settings`}
                                                  >
                                                    <EnvironmentSettingsIcon className='aside__environment-list-item--icon' />
                                                    Settings
                                                  </NavLink>
                                                )}
                                              </div>
                                            )
                                          }
                                        </Permission>
                                      )}
                                    </Permission>
                                  </Collapsible>
                                )}
                                projectId={this.props.projectId}
                                environmentId={environmentId}
                                clearableValue={false}
                                onChange={(environment) => {
                                  this.context.router.history.push(
                                    `/project/${this.props.projectId}/environment/${environment}/features`,
                                  )
                                  AsyncStorage.setItem(
                                    'lastEnv',
                                    JSON.stringify({
                                      environmentId: environment,
                                      orgId: AccountStore.getOrganisation().id,
                                      projectId: this.props.projectId,
                                    }),
                                  )
                                }}
                              />
                            </div>
                          }

                          <div className='flex flex-1' />

                          <div className='align-self-end'>
                            {Utils.getFlagsmithHasFeature('demo_feature') && (
                              <a
                                style={{
                                  color:
                                    Utils.getFlagsmithValue('demo_feature') ||
                                    '#43424f',
                                }}
                                className='aside__nav-item'
                                href='https://docs.flagsmith.com'
                              >
                                <i className='icon mr-2 ion-ios-star aside__nav-item--icon' />
                                Super cool demo feature!
                              </a>
                            )}

                            {Utils.getFlagsmithHasFeature('broken_feature') && (
                              <Link to='/broken' className='aside__nav-item'>
                                <i className='icon mr-2 ion-ios-warning aside__nav-item--icon' />
                                Demo Broken Feature
                              </Link>
                            )}
                            {this.state.version && (
                              <div className='text-muted text-small text-center'>
                                {this.state.version.tag !== 'Unknown' && (
                                  <Tooltip
                                    html
                                    title={
                                      <span>
                                        <span className='ml-2 icon ion-ios-pricetag' />{' '}
                                        {this.state.version.tag}
                                      </span>
                                    }
                                  >
                                    {`${
                                      this.state.version.frontend_sha !==
                                      'Unknown'
                                        ? `Frontend SHA: ${this.state.version.frontend_sha}`
                                        : ''
                                    }${
                                      this.state.version.backend_sha !==
                                      'Unknown'
                                        ? `${
                                            this.state.version.frontend_sha !==
                                            'Unknown'
                                              ? '<br/>'
                                              : ''
                                          }Backend SHA: ${
                                            this.state.version.backend_sha
                                          }`
                                        : ''
                                    }`}
                                  </Tooltip>
                                )}
                              </div>
                            )}

                            {E2E &&
                              AccountStore.getOrganisationRole() ===
                                'ADMIN' && (
                                <NavLink
                                  id='organisation-settings-link'
                                  activeClassName='active'
                                  className='aside__nav-item'
                                  to={`/project/${this.props.projectId}/environment/${environmentId}/organisation-settings`}
                                >
                                  <OrgSettingsIcon className='aside__nav-item--icon' />
                                  Organisation
                                </NavLink>
                              )}

                            <a
                              href='https://docs.flagsmith.com'
                              target='_blank'
                              className='aside__nav-item hidden-sm-up'
                              rel='noreferrer'
                            >
                              <DocumentationIcon className='aside__nav-item--icon' />
                              Documentation
                            </a>
                            <NavLink
                              id='account-settings-link'
                              className='aside__nav-item hidden-sm-up'
                              to={`/project/${this.props.projectId}/environment/${environmentId}/account`}
                            >
                              <UserSettingsIcon className='aside__nav-item--icon' />
                              Account Settings
                            </NavLink>
                          </div>
                        </div>
                      </React.Fragment>
                    }
                  </div>
                </div>
              </React.Fragment>
            )}
          </ProjectProvider>
        )}
      </OrganisationProvider>
    )
  }
}

module.exports = ConfigProvider(Aside)
