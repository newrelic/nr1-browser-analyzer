import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BlockText, Grid, GridItem, Icon, HeadingText, TableChart, Spinner, NerdGraphQuery, navigation, Button, Toast } from 'nr1';
import SummaryBar from './summary-bar';
import { get } from 'lodash';
import { buildResults } from './stat-utils';

function getIconType(apm) {
    if (apm.alertSeverity == 'NOT_ALERTING') {
        return Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__SERVICE__S_OK;
    } else if (apm.alertSeverity == 'WARNING') {
        return Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__SERVICE__S_WARNING;
    } else if (apm.alertSeverity == 'CRITICAL') {
        return Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__SERVICE__S_ERROR;
    } else {
        return Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__SERVICE;
    }
}

export default class Breakdown extends Component {
  static propTypes = {
    nerdletUrlState: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
  }

  _openDetails(pageUrl) {
    const { duration, entity } = this.props.nerdletUrlState;
    navigation.openStackedNerdlet({
      //staging
      //id: '0a677466-f4b3-4af1-8e4c-bc8edbc84596.details',
      //prod
      id: 'details',
      urlState: {
        pageUrl,
        duration,
        entity
      } })
  }

  render() {
    const { pageUrl, duration, entity } = this.props.nerdletUrlState;
    const durationInMinutes = duration/1000/60;
    const graphql = `{
      actor {
        account(id: ${entity.accountId}) {
          cohorts: nrql(query: "FROM PageView SELECT uniqueCount(session) as 'sessions', count(*)/uniqueCount(session) as 'avgPageViews', median(duration) as 'medianDuration', percentile(duration, 75, 95,99), count(*) WHERE appName='${entity.name}' ${pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''} FACET nr.apdexPerfZone SINCE ${durationInMinutes} MINUTES AGO") {
            results
            totalResult
          }
          ${pageUrl ? `bounceRate:nrql(query: "FROM PageView SELECT funnel(session, WHERE pageUrl = 'http://webportal.telco.nrdemo.com/browse/phones' as 'page', WHERE pageUrl != 'http://webportal.telco.nrdemo.com/browse/phones' as 'nextPage') FACET nr.apdexPerfZone") {
              results
          }` : ''}
          satisfied: nrql(query: "FROM PageView SELECT count(*), (max(timestamp)-min(timestamp)) as 'sessionLength' WHERE appName='${entity.name}' AND nr.apdexPerfZone = 'S' ${pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''} FACET session limit MAX SINCE ${durationInMinutes} MINUTES AGO") {
            results
          }
          tolerated: nrql(query: "FROM PageView SELECT count(*), (max(timestamp)-min(timestamp)) as 'sessionLength' WHERE appName='${entity.name}' AND nr.apdexPerfZone = 'T' ${pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''} FACET session limit MAX SINCE ${durationInMinutes} MINUTES AGO") {
            results
          }
          frustrated: nrql(query: "FROM PageView SELECT count(*), (max(timestamp)-min(timestamp)) as 'sessionLength' WHERE appName='${entity.name}' AND nr.apdexPerfZone = 'F' ${pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''} FACET session limit MAX SINCE ${durationInMinutes} MINUTES AGO") {
            results
          }

        }
        entity(guid: "${entity.guid}") {
          ... on BrowserApplicationEntity {
            settings {
              apdexTarget
            }
            applicationId
            servingApmApplicationId
          }
          relationships {
            source {
              entity {
                domain
                guid
                type
                ... on ApmApplicationEntityOutline {
                  alertSeverity
                }
              }
            }
          }
        }
      }
    }`;
    //console.debug("Graphql", graphql);
    return (<NerdGraphQuery query={graphql}>
      {({data, loading, error}) => {
        if (loading) {
          return <Spinner fillContainer />
        }
        if (error) {
          Toast.showToast("An error occurred.", { type: Toast.TYPE.CRITICAL, sticky: true});
          return <div className="error"><HeadingText>An error occurred</HeadingText>
            <BlockText>We recommend reloading the page and sending the error content below to the Nerdpack developer.</BlockText>
            <div className="errorDetails">{JSON.stringify(error)}</div>
          </div>
        }
        //debugger;
        const results = buildResults(data.actor.account);
        const {settings: {apdexTarget}, servingApmApplicationId } = get(data, 'actor.entity');
        const browserSettingsUrl = `https://rpm.newrelic.com/accounts/${entity.accountId}/browser/${servingApmApplicationId}/edit#/settings`;
        const apmService = get(data, 'actor.entity.relationships[0].source.entity');
        if (apmService) {
            apmService.iconType = getIconType(apmService);
        }
        //console.debug("Data", [data, results]);
        return <Grid className="breakdownContainer">
        <GridItem columnSpan={12}>
          <SummaryBar {...this.props.nerdletUrlState} apmService={apmService} />
        </GridItem>
        <GridItem columnSpan={4} className="cohort satisfied">
            <Icon className="icon"
                type={Icon.TYPE.PROFILES__EVENTS__LIKE}
                color="green"
            />
            <h3 className="cohortTitle">Satisfied</h3>
            <p className="cohortDescription"><em>Satisfied</em> performance based on an <a href={browserSettingsUrl} target="seldon">apdex T of <em>{apdexTarget}</em></a>.</p>
            <div className="cohortStats satisfiedStats">
                <div className="cohortStat">
                    <span className="label">Sessions</span>
                    <span className="value">{results.satisfied.sessions}</span>
                </div>
                <div className="cohortStat">
                    <span className="label">Pgs / Session</span>
                    <span className="value">{results.satisfied.avgPageViews}</span>
                </div>
                <div className="cohortStat">
                    <span className="label">{!pageUrl ? "Bounce Rate" : "Exit Rate"}</span>
                    <span className="value">{results.satisfied.bounceRate}%{!pageUrl ? "*" : ""}</span>
                </div>
                <div className="cohortStat">
                    <span className="label">Avg. Session</span>
                    <span className="value">{results.satisfied.avgSessionLength}*</span>
                </div>
                <div className="cohortWideSection">
                    <h5 className="sectionTitle">Load Times</h5>
                    <div className="cohortStat">
                        <span className="label">Median</span>
                        <span className="value">{results.satisfied.medianDuration}</span>
                    </div>
                    <div className="cohortStat">
                        <span className="label">75th</span>
                        <span className="value">{results.satisfied.duration75}</span>
                    </div>
                    <div className="cohortStat">
                        <span className="label">95th</span>
                        <span className="value">{results.satisfied.duration95}</span>
                    </div>
                    <div className="cohortStat">
                        <span className="label">99th</span>
                        <span className="value">{results.satisfied.duration99}</span>
                    </div>
                </div>
            </div>
        </GridItem>
        <GridItem columnSpan={4} className="cohort tolerated">
            <Icon className="icon"
                sizeType={Icon.SIZE_TYPE.NORMAL}
                type={Icon.TYPE.INTERFACE__STATE__WARNING}
                color="#F5A020"
            />
            <h3 className="cohortTitle">Tolerated</h3>
            <p className="cohortDescription"><em>Tolerated</em> performance based on an <a href={browserSettingsUrl} target="seldon">apdex T of <em>{apdexTarget}</em></a>.</p>
            <div className="cohortStats toleratedStats">
                <div className="cohortStat">
                    <span className="label">Sessions</span>
                    <span className="value">{results.tolerated.sessions}</span>
                </div>
                <div className="cohortStat">
                    <span className="label">Pgs / Session</span>
                    <span className="value">{results.tolerated.avgPageViews}</span>
                </div>
                <div className="cohortStat">
                    <span className="label">{!pageUrl ? "Bounce Rate" : "Exit Rate"}</span>
                    <span className="value">{results.tolerated.bounceRate}%{!pageUrl ? "*" : ""}</span>
                </div>
                <div className="cohortStat">
                    <span className="label">Avg. Session</span>
                    <span className="value">{results.tolerated.avgSessionLength}*</span>
                </div>
                <div className="cohortWideSection">
                    <h5 className="sectionTitle">Load Times</h5>
                    <div className="cohortStat">
                        <span className="label">Median</span>
                        <span className="value">{results.tolerated.medianDuration}</span>
                    </div>
                    <div className="cohortStat">
                        <span className="label">75th</span>
                        <span className="value">{results.tolerated.duration75}</span>
                    </div>
                    <div className="cohortStat">
                        <span className="label">95th</span>
                        <span className="value">{results.tolerated.duration95}</span>
                    </div>
                    <div className="cohortStat">
                        <span className="label">99th</span>
                        <span className="value">{results.tolerated.duration99}</span>
                    </div>
                </div>
            </div>
        </GridItem>
        <GridItem columnSpan={4} className="cohort frustrated">
                <Icon className="icon"
                    type={Icon.TYPE.INTERFACE__STATE__CRITICAL}
                    color="red"
                />
                <h3 className="cohortTitle">Frustrated</h3>
                <p className="cohortDescription"><em>Frustrated</em> performance based on an <a href={browserSettingsUrl} target="seldon">apdex T of <em>{apdexTarget}</em></a>.</p>
                <div className="cohortStats frustratedStats">
                    <div className="cohortStat">
                        <span className="label">Sessions</span>
                        <span className="value">{results.frustrated.sessions}</span>
                    </div>
                    <div className="cohortStat">
                        <span className="label">Pgs / Session</span>
                        <span className="value">{results.frustrated.avgPageViews}</span>
                    </div>
                    <div className="cohortStat">
                        <span className="label">{!pageUrl ? "Bounce Rate" : "Exit Rate"}</span>
                        <span className="value">{results.frustrated.bounceRate}%{!pageUrl ? "*" : ""}</span>
                    </div>
                    <div className="cohortStat">
                        <span className="label">Avg. Session</span>
                        <span className="value">{results.frustrated.avgSessionLength}*</span>
                    </div>
                    <div className="cohortWideSection">
                        <h5 className="sectionTitle">Load Times</h5>
                        <div className="cohortStat">
                            <span className="label">Median</span>
                            <span className="value">{results.frustrated.medianDuration}</span>
                        </div>
                        <div className="cohortStat">
                            <span className="label">75th</span>
                            <span className="value">{results.frustrated.duration75}</span>
                        </div>
                        <div className="cohortStat">
                            <span className="label">95th</span>
                            <span className="value">{results.frustrated.duration95}</span>
                        </div>
                        <div className="cohortStat">
                            <span className="label">99th</span>
                            <span className="value">{results.frustrated.duration99}</span>
                        </div>
                    </div>
                </div>
            </GridItem>
        <BlockText className="cohortsSmallPrint">* Note that these calculations are approximations based on a sample of the total data in New Relic for this Browser application.</BlockText>
        <GridItem columnSpan={4} className="cohort improvement">
            <Icon className="icon"
              type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_TOP__V_ALTERNATE}
              color="green"
            />
            <h3 className="cohortTitle">Improvement Opportunities</h3>
            <p className="cohortDescription">Moving <em>Tolerated</em> and <em>Frustrated</em> sessions to <em>Satisfied</em> and assuming no change in the Satisfied <em>Bounce Rate</em> or <em>Avg. Session</em> length.</p>
            <div className="cohortStats improvementStats">
              <div className="cohortStat">
                  <span className="label">Improved Sessions</span>
                  <span className="value">{results.recommendations.sessions}</span>
              </div>
              <div className="cohortStat">
                  <span className="label">Added Page Views</span>
                  <span className="value">{results.recommendations.pageviews}</span>
              </div>
              <div className="cohortStat">
                  <span className="label">Time / Improved Session</span>
                  <span className="value">{results.recommendations.siteTime}</span>
              </div>
              <div className="cohortStat">
                  <span className="label">Load Time Savings</span>
                  <span className="value">{results.recommendations.loadTime}</span>
              </div>
            </div>
          </GridItem>
        {pageUrl ? null : <GridItem className="pageUrlTable" columnSpan={8}>
            <HeadingText type={HeadingText.TYPE.HEADING3}>Top Performance Improvement Targets</HeadingText>
            <TableChart
                className="tableChart"
                accountId={entity.accountId}
                query={`FROM PageView SELECT count(*) as 'Page Count', average(duration) as 'Avg. Duration', apdex(duration, ${apdexTarget}) as 'Apdex' WHERE appName='${entity.name}' AND nr.apdexPerfZone in ('F', 'T') FACET pageUrl LIMIT 100 SINCE ${durationInMinutes} MINUTES AGO `}
                onClickTable={(...args) => {
                    //console.debug(args);
                    this._openDetails(args[1].pageUrl);
                }}
            />
        </GridItem>}
    </Grid>;
      }}
    </NerdGraphQuery>);
  }
}
