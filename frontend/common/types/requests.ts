import { Account, Segment, Tag, FeatureStateValue } from './responses'

export type PagedRequest<T> = T & {
  page?: number
  page_size?: number
  q?: string
}
export type OAuthType = 'github' | 'saml' | 'google'
export type PermissionLevel = 'organisation' | 'project' | 'environment'
export type Req = {
  getSegments: PagedRequest<{
    q?: string
    projectId: number | string
    identity?: number
  }>
  deleteSegment: { projectId: number | string; id: number }
  updateSegment: { projectId: number | string; segment: Segment }
  createSegment: {
    projectId: number | string
    segment: Omit<Segment, 'id' | 'uuid' | 'project'>
  }
  getAuditLogs: PagedRequest<{
    search?: string
    project: string
    environments?: string
  }>
  getOrganisations: {}
  getProjects: {
    organisationId: string
  }
  getEnvironments: {
    projectId: string
  }
  getOrganisationUsage: {
    organisationId: string
    projectId?: string
    environmentId?: string
  }
  deleteIdentity: {
    id: string
    environmentId: string
    isEdge: boolean
  }
  createIdentities: {
    isEdge: boolean
    environmentId: string
    identifiers: string[]
  }
  featureSegment: {
    segment: string
  }
  getIdentities: PagedRequest<{
    environmentId: string
    pageType?: 'NEXT' | 'PREVIOUS'
    search?: string
    pages?: (string | undefined)[] // this is needed for edge since it returns no paging info other than a key
    isEdge: boolean
  }>
  getPermission: { id: string; level: PermissionLevel }
  getAvailablePermissions: { level: PermissionLevel }
  getTag: { id: string }
  updateTag: { projectId: string; tag: Tag }
  deleteTag: {
    id: number
    projectId: string
  }
  getTags: {
    projectId: string
  }
  createTag: { projectId: string; tag: Omit<Tag, 'id'> }
  getSegment: { projectId: string; id: string }
  updateAccount: Account
  deleteAccount: {
    current_password: string
    delete_orphan_organisations: boolean
  }
  updateUserEmail: { current_password: string; new_email: string }
  createGroupAdmin: {
    group: number | string
    user: number | string
    orgId: number | string
  }
  deleteGroupAdmin: {
    orgId: number | string
    group: number | string
    user: number | string
  }
  getGroups: PagedRequest<{
    orgId: string
  }>
  deleteGroup: { id: number | string; orgId: number | string }
  getGroup: { id: string; orgId: string }
  getMyGroups: PagedRequest<{
    orgId: string
  }>
  createSegmentOverride: {
    environmentId: string
    featureId: string
    enabled: boolean
    feature_segment: featureSegment
    feature_state_value: FeatureStateValue
  }
  getIdentityFeatureStates: {
    environment: string
    user: string
  }
  getProjectFlags: { project: string }
  // END OF TYPES
}
