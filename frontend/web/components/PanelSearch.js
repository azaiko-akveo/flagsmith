import React, { Component } from 'react'
import { FixedSizeList as List } from 'react-window'
import Popover from './base/Popover'
import Input from './base/forms/Input'

const PanelSearch = class extends Component {
  static displayName = 'PanelSearch'

  static propTypes = {
    actionButton: OptionalNode,
    filterElement: OptionalNode,
    filterRow: OptionalFunc,
    goToPage: OptionalFunc,
    isLoading: OptionalBool,
    items: propTypes.any,
    nextPage: OptionalFunc,
    noResultsText: OptionalString,
    paging: OptionalObject,
    renderNoResults: propTypes.any,
    renderRow: RequiredFunc,
    search: OptionalString,
    searchPanel: OptionalNode,
    sorting: OptionalArray,
    title: propTypes.node,
  }

  constructor(props, context) {
    super(props, context)
    const defaultSortingOption = _.find(_.get(props, 'sorting', []), {
      default: true,
    })
    this.state = {
      sortBy: defaultSortingOption ? defaultSortingOption.value : null,
      sortOrder: defaultSortingOption ? defaultSortingOption.order : null,
    }
  }

  filter() {
    let search = this.props.search || this.state.search || ''
    if (this.state.exact) {
      search = search.replace(/^"+|"+$/g, '')
    }
    const filter = this.props.filter
    const { filterRow, items } = this.props
    if (filterRow && (search || filter)) {
      return this.sort(
        _.filter(items, (value, index) =>
          filterRow(value, search.toLowerCase(), index),
        ),
      )
    }
    return this.sort(items)
  }

  sort(items) {
    const { sortBy, sortOrder } = this.state
    if (sortBy) {
      return _.orderBy(items, [sortBy], [sortOrder])
    }

    return items
  }

  onSort(e, sortOption) {
    e.preventDefault()
    const { sortBy, sortOrder } = this.state
    if (sortOption.value === sortBy) {
      this.setState({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' }, () => {
        if (this.props.onSortChange) {
          this.props.onSortChange({
            sortBy: this.state.sortBy,
            sortOrder: this.state.sortOrder,
          })
        }
      })
    } else {
      this.setState(
        { sortBy: sortOption.value, sortOrder: sortOption.order },
        () => {
          if (this.props.onSortChange) {
            this.props.onSortChange({
              sortBy: this.state.sortBy,
              sortOrder: this.state.sortOrder,
            })
          }
        },
      )
    }
  }

  renderContainer = (children) => {
    const renderRow = ({ index, style }) => (
      <div style={style}>{this.props.renderRow(children[index])}</div>
    )
    if (children && children.length > 100 && this.props.itemHeight) {
      return (
        <List
          style={{ overflowX: 'hidden' }}
          height={this.props.itemHeight * 10}
          itemCount={children.length}
          itemSize={this.props.itemHeight}
          width='100%'
        >
          {renderRow}
        </List>
      )
    }
    return children.map(this.props.renderRow)
  }

  render() {
    const { sortBy, sortOrder } = this.state
    const {
      action,
      goToPage,
      isLoading,
      items,
      nextPage,
      paging,
      prevPage,
      renderNoResults,
      sorting,
    } = this.props
    const filteredItems = this.filter(items)
    const currentSort = _.find(sorting, { value: sortBy })

    let search = this.props.search || this.state.search || ''
    if (this.state.exact) {
      search = search.replace(/^"+|"+$/g, '')
    }
    return !search &&
      (!filteredItems || !filteredItems.length) &&
      !this.props.isLoading &&
      !this.props.renderSearchWithNoResults ? (
      renderNoResults || null
    ) : (
      <Panel
        className={this.props.className}
        title={this.props.title}
        action={
          this.props.filterRow ||
          this.props.sorting ||
          this.props.filterElement ||
          this.props.actionButton ? (
            <Row>
              {!!this.props.filterElement && this.props.filterElement}

              {!!this.props.sorting && (
                <Row className='mr-3 relative'>
                  <Popover
                    renderTitle={(toggle) => (
                      <a onClick={toggle} className='text-muted'>
                        <div className='flex-column ion ion-md-funnel' />
                        {currentSort ? currentSort.label : 'Unsorted'}
                      </a>
                    )}
                  >
                    {(toggle) => (
                      <div className='popover-inner__content'>
                        {this.props.sorting.map((sortOption, i) => (
                          <a
                            key={i}
                            className='popover-bt__list-item'
                            href='#'
                            onClick={(e) => {
                              this.onSort(e, sortOption)
                              toggle()
                            }}
                          >
                            <Row space>
                              <Row className='flex-1'>{sortOption.label}</Row>
                              {currentSort &&
                                currentSort.value === sortOption.value && (
                                  <Row>
                                    <div
                                      className={`flex-column ion ${
                                        sortOrder === 'asc'
                                          ? 'ion-ios-arrow-up'
                                          : 'ion-ios-arrow-down'
                                      }`}
                                    />
                                  </Row>
                                )}
                            </Row>
                          </a>
                        ))}
                      </div>
                    )}
                  </Popover>
                </Row>
              )}
              {!!this.props.filterRow && (
                <Row>
                  {this.props.showExactFilter && (
                    <div style={{ width: 175 }}>
                      <Select
                        size='select-sm'
                        styles={{
                          control: (base) => ({
                            ...base,
                            '&:hover': { borderColor: '$bt-brand-secondary' },
                            border: '1px solid $bt-brand-secondary',
                            height: 30,
                          }),
                        }}
                        onChange={(v) => {
                          this.setState({ exact: v.label === 'Exact' })
                          if (this.props.search) {
                            this.props.onChange &&
                              this.props.onChange(
                                !this.state.exact
                                  ? `"${this.props.search}"`
                                  : this.props.search.replace(/^"+|"+$/g, ''),
                              )
                          }
                        }}
                        value={{
                          label: this.state.exact
                            ? 'Exact'
                            : this.props.filterLabel ||
                              (Utils.getIsEdge() ? 'Starts with' : 'Contains'),
                        }}
                        options={[
                          {
                            label: Utils.getIsEdge()
                              ? 'Starts with'
                              : 'Contains',
                            value: 'Contains',
                          },
                          {
                            label: 'Exact',
                            value: 'Exact',
                          },
                        ]}
                      />
                    </div>
                  )}
                  <Row onClick={() => this.input.focus()}>
                    <Input
                      ref={(c) => (this.input = c)}
                      onBlur={this.props.onBlur}
                      onChange={(e) => {
                        const v = Utils.safeParseEventValue(e)
                        this.props.onChange
                          ? this.props.onChange(this.state.exact ? `"${v}"` : v)
                          : this.setState({
                              search: Utils.safeParseEventValue(e),
                            })
                      }}
                      type='text'
                      value={search}
                      className='ml-3'
                      size='small'
                      placeholder='Search'
                      search
                    />
                  </Row>
                </Row>
              )}
              {!!this.props.actionButton && this.props.actionButton}
            </Row>
          ) : (
            action || null
          )
        }
      >
        {this.props.searchPanel}
        <div
          id={this.props.id}
          className='search-list'
          style={isLoading ? { opacity: 0.5 } : {}}
        >
          {this.props.header}

          {this.props.isLoading && (!filteredItems || !items) ? (
            <div className='text-center'>
              <Loader />
            </div>
          ) : filteredItems && filteredItems.length ? (
            this.renderContainer(filteredItems)
          ) : renderNoResults && !search ? (
            renderNoResults
          ) : (
            <Row className='list-item'>
              {!isLoading && (
                <>
                  {this.props.noResultsText?.(search) || (
                    <div className='table-column'>
                      {'No results '}
                      {search && (
                        <span>
                          for
                          <strong>{` "${search}"`}</strong>
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </Row>
          )}
          {!!paging && (
            <Paging
              paging={paging}
              isLoading={isLoading}
              nextPage={nextPage}
              prevPage={prevPage}
              goToPage={goToPage}
            />
          )}

          {this.props.renderFooter && this.props.renderFooter()}
        </div>
      </Panel>
    )
  }
}
export default PanelSearch
