import React from 'react';
import PropTypes from 'prop-types';
import {
  BlockText,
  Grid,
  GridItem,
  HeadingText,
  TableChart,
  Spinner,
  NerdGraphQuery,
  navigation,
  Toast,
  PlatformStateContext,
  NerdletStateContext
} from 'nr1';
import { get } from 'lodash';
import CohortTolerated from './cohort-tolerated';
import CohortSatisifed from './cohort-satisfied';
import CohortFrustrated from './cohort-frustrated';
import CohortImprovement from './cohort-improvement';
import SummaryBar from './summary-bar';
import { timeRangeToNrql, NerdGraphError } from '@newrelic/nr1-community';
import { getIconType } from '../utils';
import { generateCohortsQuery } from '../utils/queries';
import { buildResults } from './stat-utils';

export default class Breakdown extends React.PureComponent {
  static propTypes = {
    entity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
  }

  _openDetails(pageUrl) {
    const { entity } = this.props;
    navigation.openStackedNerdlet({
      id: 'details',
      urlState: {
        pageUrl,
        entityGuid: entity.guid
      }
    });
  }

  render() {
    const { entity } = this.props;

    if (!entity) {
      return <Spinner fillContainer />;
    }

    return (
      <PlatformStateContext.Consumer>
        {platformUrlState => (
          <NerdletStateContext.Consumer>
            {nerdletUrlState => {
              const { pageUrl } = nerdletUrlState;
              const timePickerRange = timeRangeToNrql(platformUrlState);
              const query = generateCohortsQuery({
                entity,
                pageUrl,
                timePickerRange
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
                        sticky: true
                      });

                      return (
                        <div className="error">
                          <HeadingText>An error occurred</HeadingText>
                          <BlockText>
                            We recommend reloading the page and sending the
                            error content below to the Nerdpack developer.
                          </BlockText>
                          <NerdGraphError error={error} />
                        </div>
                      );
                    }

                    const results = buildResults(data.actor.account);
                    const {
                      settings: { apdexTarget },
                      servingApmApplicationId
                    } = entity;
                    const browserSettingsUrl = `https://rpm.newrelic.com/accounts/${entity.accountId}/browser/${servingApmApplicationId}/edit#/settings`;
                    const apmService = get(
                      data,
                      'actor.entity.relationships[0].source.entity'
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
                          * Note that these calculations are approximations
                          based on a sample of the total data in New Relic for
                          this Browser application.
                        </BlockText>
                        <GridItem columnSpan={4} className="cohort improvement">
                          <CohortImprovement results={results} />
                        </GridItem>

                        {pageUrl ? null : (
                          <GridItem className="pageUrlTable" columnSpan={8}>
                            <HeadingText type={HeadingText.TYPE.HEADING3}>
                              Top Performance Improvement Targets
                            </HeadingText>
                            <TableChart
                              className="tableChart"
                              accountId={entity.accountId}
                              query={`FROM PageView SELECT count(*) as 'Page Count', average(duration) as 'Avg. Duration', apdex(duration, ${apdexTarget}) as 'Apdex' WHERE appName='${entity.name}' AND nr.apdexPerfZone in ('F', 'T') FACET pageUrl LIMIT 100 ${timePickerRange}`}
                              onClickTable={(...args) => {
                                this._openDetails(args[1].pageUrl);
                              }}
                            />
                          </GridItem>
                        )}
                      </Grid>
                    );
                  }}
                </NerdGraphQuery>
              );
            }}
          </NerdletStateContext.Consumer>
        )}
      </PlatformStateContext.Consumer>
    );
  }
}
