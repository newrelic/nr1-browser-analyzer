import React from 'react';
import PropTypes from 'prop-types';
import {
  BlockText,
  Grid,
  GridItem,
  HeadingText,
  NrqlQuery,
  Spinner,
  NerdGraphQuery,
  navigation,
  Toast,
  PlatformStateContext,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableRowCell,
} from 'nr1';
import { get } from 'lodash';
import CohortTolerated from './cohort-tolerated';
import CohortSatisifed from './cohort-satisfied';
import CohortFrustrated from './cohort-frustrated';
import CohortImprovement from './cohort-improvement';
import SummaryBar from './summary-bar';
import { timeRangeToNrql } from '../utils/timeRangeToNrql';
import { NerdGraphError } from './NerdGraphError';
import { getIconType } from '../utils';
import { generateCohortsQuery } from '../utils/queries';
import { buildResults } from './stat-utils';
import NrqlFactory from '../nrql-factory';

export default class Breakdown extends React.PureComponent {
  static propTypes = {
    entity: PropTypes.object.isRequired,
    nrqlFactory: PropTypes.instanceOf(NrqlFactory).isRequired,
    nerdletUrlState: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      sortingType: TableHeaderCell.SORTING_TYPE.ASCENDING,
      sortedColumn: 0,
    };

    this.toggleSortingType = this.toggleSortingType.bind(this);
  }

  _openDetails(pageUrl) {
    const { entity } = this.props;
    navigation.openStackedNerdlet({
      id: 'details',
      urlState: {
        pageUrl,
        entityGuid: entity.guid,
      },
    });
  }

  toggleSortingType(sortedColumn) {
    this.setState((prevState) => {
      return {
        sortedColumn: sortedColumn,
        sortingType:
          prevState.sortingType === TableHeaderCell.SORTING_TYPE.DESCENDING
            ? TableHeaderCell.SORTING_TYPE.ASCENDING
            : TableHeaderCell.SORTING_TYPE.DESCENDING,
      };
    });
  }

  renderTopPeformanceTableItems(data) {
    return data.map((item, index) => {
      const pageUrl = item.name;
      const pageCount = item.results[0].count;
      const averageDuration = item.results[1].average.toFixed(2);
      const apdex = item.results[2].score.toFixed(2);

      const output = {
        pageUrl,
        pageCount,
        averageDuration,
        apdex,
        columnIndex: index,
      };

      return output;
    });
  }

  renderTopPerformanceTable(data) {
    return (
      <Table
        className="performance-improvement-table"
        spacingType={[Table.SPACING_TYPE.LARGE, Table.SPACING_TYPE.NONE]}
        items={this.renderTopPeformanceTableItems(data.facets)}
      >
        <TableHeader>
          <TableHeaderCell
            value={({ item }) => item.pageUrl}
            sortable
            onClick={(event, sortingData, sortedColumn = 0) => {
              this.toggleSortingType(sortedColumn);
            }}
            sortingOrder={0}
            sortingType={
              this.state.sortedColumn === 0 ? this.state.sortingType : undefined
            }
          >
            Page URL
          </TableHeaderCell>
          <TableHeaderCell
            alignmentType={TableRowCell.ALIGNMENT_TYPE.RIGHT}
            width="130px"
            value={({ item }) => item.pageCount}
            sortable
            onClick={(event, sortingData, sortedColumn = 1) => {
              this.toggleSortingType(sortedColumn);
            }}
            sortingOrder={1}
            sortingType={
              this.state.sortedColumn === 1 ? this.state.sortingType : undefined
            }
          >
            Page Count
          </TableHeaderCell>
          <TableHeaderCell
            alignmentType={TableRowCell.ALIGNMENT_TYPE.RIGHT}
            width="130px"
            value={({ item }) => item.averageDuration}
            sortable
            onClick={(event, sortingData, sortedColumn = 2) => {
              this.toggleSortingType(sortedColumn);
            }}
            sortingOrder={2}
            sortingType={
              this.state.sortedColumn === 2 ? this.state.sortingType : undefined
            }
          >
            Avg. duration
          </TableHeaderCell>
          <TableHeaderCell
            alignmentType={TableRowCell.ALIGNMENT_TYPE.RIGHT}
            width="80px"
            value={({ item }) => item.apdex}
            sortable
            onClick={(event, sortingData, sortedColumn = 3) => {
              this.toggleSortingType(sortedColumn);
            }}
            sortingOrder={3}
            sortingType={
              this.state.sortedColumn === 3 ? this.state.sortingType : undefined
            }
          >
            Apdex
          </TableHeaderCell>
        </TableHeader>
        {({ item }) => (
          <TableRow
            actions={[
              {
                label: 'View details for this page',
                onClick: () => this._openDetails(item.pageUrl),
              },
            ]}
          >
            <TableRowCell onClick={() => this._openDetails(item.pageUrl)}>
              {item.pageUrl}
            </TableRowCell>
            <TableRowCell alignmentType={TableRowCell.ALIGNMENT_TYPE.RIGHT}>
              {item.pageCount}
            </TableRowCell>
            <TableRowCell alignmentType={TableRowCell.ALIGNMENT_TYPE.RIGHT}>
              {item.averageDuration}
            </TableRowCell>
            <TableRowCell alignmentType={TableRowCell.ALIGNMENT_TYPE.RIGHT}>
              {item.apdex}
            </TableRowCell>
          </TableRow>
        )}
      </Table>
    );
  }

  render() {
    const { entity, nrqlFactory, nerdletUrlState } = this.props;

    if (!entity) {
      return <Spinner fillContainer />;
    }

    return (
      <PlatformStateContext.Consumer>
        {(platformUrlState) => {
          const { pageUrl } = nerdletUrlState;
          const timePickerRange = timeRangeToNrql(platformUrlState);
          const query = generateCohortsQuery({
            entity,
            pageUrl,
            timePickerRange,
            nrqlFactory,
          });

          return (
            <NerdGraphQuery query={query}>
              {({ data, loading, error }) => {
                if (loading) {
                  return <Spinner fillContainer />;
                }

                if (error) {
                  Toast.showToast({
                    title: 'An error occurred.',
                    type: Toast.TYPE.CRITICAL,
                    sticky: true,
                  });

                  return (
                    <div className="error">
                      <HeadingText>An error occurred</HeadingText>
                      <BlockText>
                        We recommend reloading the page and sending the error
                        content below to the Nerdpack developer.
                      </BlockText>
                      <NerdGraphError error={error} />
                    </div>
                  );
                }

                const results = buildResults(data.actor.account);
                const { settings, servingApmApplicationId } = entity;
                const apdexTarget = settings ? settings.apdexTarget : 0.5;
                const browserSettingsUrl = `https://rpm.newrelic.com/accounts/${entity.accountId}/browser/${servingApmApplicationId}/edit#/settings`;
                const apmService = get(
                  data,
                  'actor.entity.relatedEntities.results[0].source.entity'
                );
                if (apmService) {
                  apmService.iconType = getIconType(apmService);
                }
                return (
                  <Grid className="breakdownContainer">
                    <GridItem columnSpan={12}>
                      <SummaryBar {...this.props} apmService={apmService} />
                    </GridItem>
                    <GridItem columnSpan={4} className="cohort satisfied">
                      <CohortSatisifed
                        results={results}
                        pageUrl={pageUrl}
                        browserSettingsUrl={browserSettingsUrl}
                        apdexTarget={apdexTarget}
                      />
                    </GridItem>
                    <GridItem columnSpan={4} className="cohort tolerated">
                      <CohortTolerated
                        results={results}
                        pageUrl={pageUrl}
                        browserSettingsUrl={browserSettingsUrl}
                        apdexTarget={apdexTarget}
                      />
                    </GridItem>
                    <GridItem columnSpan={4} className="cohort frustrated">
                      <CohortFrustrated
                        results={results}
                        pageUrl={pageUrl}
                        browserSettingsUrl={browserSettingsUrl}
                        apdexTarget={apdexTarget}
                      />
                    </GridItem>
                    <BlockText className="cohortsSmallPrint">
                      * Note that these calculations are approximations based on
                      a sample of the total data in New Relic for this Browser
                      application.
                    </BlockText>
                    <GridItem columnSpan={4} className="cohort improvement">
                      <CohortImprovement results={results} />
                    </GridItem>

                    {pageUrl ? null : (
                      <GridItem className="pageUrlTable" columnSpan={8}>
                        <HeadingText type={HeadingText.TYPE.HEADING3}>
                          Top Performance Improvement Targets
                        </HeadingText>
                        <NrqlQuery
                          accountIds={[entity.accountId]}
                          formatType={NrqlQuery.FORMAT_TYPE.RAW}
                          query={nrqlFactory.getPerformanceTargets({
                            entity,
                            apdexTarget,
                            platformUrlState,
                            timeNrqlFragment: timePickerRange,
                          })}
                        >
                          {({ data }) => {
                            if (data) {
                              return this.renderTopPerformanceTable(data);
                            } else {
                              return '';
                            }
                          }}
                        </NrqlQuery>
                      </GridItem>
                    )}
                  </Grid>
                );
              }}
            </NerdGraphQuery>
          );
        }}
      </PlatformStateContext.Consumer>
    );
  }
}
