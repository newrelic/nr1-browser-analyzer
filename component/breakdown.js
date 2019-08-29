import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BlockText, Grid, GridItem, Icon, HeadingText, TableChart, Spinner, NerdGraphQuery, navigation, Button } from 'nr1';
import SummaryBar from './summary-bar';
import numeral from 'numeral';
import moment from 'moment';
import { get } from 'lodash';

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

function calcTotalSessionLength(a) {
  let accumulator = 0;
  a.forEach(result => {
      accumulator += parseFloat(result.sessionLength);
  })
  return accumulator;
}

function calcBounces(a) {
  let accumulator = 0;
  a.forEach(result => {
      const count = parseInt(result.count);
      if (count == 1) {
          accumulator++;
      }
  })
  return accumulator;
}

export default class Breakdown extends Component {
  static propTypes = {
    nerdletUrlState: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
  }

  _openDetails(pageUrl) {
    const { duration, apdexT, entity } = this.props.nerdletUrlState;
    navigation.openStackedNerdlet({
      id: 'edf9ac5a-ba6d-4371-9cff-905a5d2c3238.details',
      urlState: {
        pageUrl,
        duration,
        entity
      } })
  }

  _buildResults({ cohorts, satisfied, tolerated, frustrated, bounceRate }) {
    const S = cohorts.results.find(c => c.facet == 'S');
    const T = cohorts.results.find(c => c.facet == 'T');
    const F = cohorts.results.find(c => c.facet == 'F');
    const obj = {
        satisfied: {
            sessions: numeral(S.sessions).format("0,0"),
            pageviews: S.count,
            medianDuration: parseFloat(S.medianDuration["50"]).toFixed(2),
            avgPageViews: parseFloat(S.avgPageViews).toFixed(2),
            duration75: parseFloat(S["percentile.duration"]["75"]).toFixed(2),
            duration95: parseFloat(S["percentile.duration"]["95"]).toFixed(2),
            duration99: parseFloat(S["percentile.duration"]["99"]).toFixed(2),
            totalSessionLength: calcTotalSessionLength(satisfied.results),
            totalSamples: satisfied.results.length,
            bounces: calcBounces(satisfied.results)
        },
        tolerated: {
            sessions: numeral(T.sessions).format("0,0"),
            pageviews: T.count,
            medianDuration: parseFloat(T.medianDuration["50"]).toFixed(2),
            avgPageViews: parseFloat(T.avgPageViews).toFixed(2),
            duration75: parseFloat(T["percentile.duration"]["75"]).toFixed(2),
            duration95: parseFloat(T["percentile.duration"]["95"]).toFixed(2),
            duration99: parseFloat(T["percentile.duration"]["99"]).toFixed(2),
            totalSessionLength: calcTotalSessionLength(tolerated.results),
            totalSamples: tolerated.results.length,
            bounces: calcBounces(tolerated.results)
        },
        frustrated: {
            sessions: numeral(F.sessions).format("0,0"),
            pageviews: F.count,
            medianDuration: parseFloat(F.medianDuration["50"]).toFixed(2),
            avgPageViews: parseFloat(F.avgPageViews).toFixed(2),
            duration75: parseFloat(F["percentile.duration"]["75"]).toFixed(2),
            duration95: parseFloat(F["percentile.duration"]["95"]).toFixed(2),
            duration99: parseFloat(F["percentile.duration"]["99"]).toFixed(2),
            totalSessionLength: calcTotalSessionLength(frustrated.results),
            totalSamples: frustrated.results.length,
            bounces: calcBounces(frustrated.results)
        }
    };
    if (bounceRate) {
        const SbounceRate = bounceRate.results.find(r => r.facet == "S");
        obj.satisfied.bounces = SbounceRate.steps[0] - SbounceRate.steps[1];
        obj.satisfied.totalSamples = SbounceRate.steps[0];

        const TbounceRate = bounceRate.results.find(r => r.facet == "T");
        obj.tolerated.bounces = TbounceRate.steps[0] - TbounceRate.steps[1];
        obj.tolerated.totalSamples = TbounceRate.steps[0];

        const FbounceRate = bounceRate.results.find(r => r.facet == "F");
        obj.frustrated.bounces = FbounceRate.steps[0] - FbounceRate.steps[1];
        obj.frustrated.totalSamples = FbounceRate.steps[0];
    }
    const rawBounceRate = [
        obj.satisfied.bounces/obj.satisfied.totalSamples,
        obj.tolerated.bounces/obj.tolerated.totalSamples,
        obj.frustrated.bounces/obj.frustrated.totalSamples
    ];
    const retentionRate = [
        1.0 - rawBounceRate[0],
        1.0 - rawBounceRate[1],
        1.0 - rawBounceRate[2]
    ];
    const rawSessionLength = [
        obj.satisfied.totalSessionLength/obj.satisfied.totalSamples,
        obj.tolerated.totalSessionLength/obj.tolerated.totalSamples,
        obj.frustrated.totalSessionLength/obj.frustrated.totalSamples
    ];

    obj.satisfied.bounceRate = parseFloat(rawBounceRate[0]*100).toFixed(2);
    obj.satisfied.avgSessionLength = moment(rawSessionLength[0]).format('m:ss');

    obj.tolerated.bounceRate = parseFloat((rawBounceRate[1])*100).toFixed(2);
    obj.tolerated.avgSessionLength = moment(rawSessionLength[1]).format('m:ss');

    obj.frustrated.bounceRate = parseFloat((rawBounceRate[2])*100).toFixed(2);
    obj.frustrated.avgSessionLength = moment(rawSessionLength[2]).format('m:ss');

    const engagedSessions = Math.round((F.sessions * rawBounceRate[2] + T.sessions * rawBounceRate[1]) * retentionRate[0]);

    const additionalPageViews = (engagedSessions * S.avgPageViews) - (T.sessions * retentionRate[1] + F.sessions * retentionRate[2]);

    const additionalTime = (engagedSessions * rawSessionLength[0]) - (T.sessions * rawSessionLength[1] + F.sessions * rawSessionLength[2]);

    const loadTimeSavings = (T.count * (T.medianDuration["50"] - S.medianDuration["50"])) + (F.count * (F.medianDuration["50"] - S.medianDuration["50"]));

    obj.recommendations = {
        engagedSessions: engagedSessions > 0 ? numeral(engagedSessions).format("0,0") : "N/A",
        additionalPageViews: additionalPageViews > 0 ? numeral(additionalPageViews).format("0,0") : "N/A",
        additionalTime: additionalTime > 0 ? moment(additionalTime).format('H:mm:ss') : "N/A",
        loadTimeSavings: loadTimeSavings > 0 ? moment(loadTimeSavings).format('H:mm:ss') : "N/A",
    }
    return obj;
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
          return <BlockText>{JSON.stringify(error)}</BlockText>
        }
        const results = this._buildResults(data.actor.account);
        const {settings: {apdexTarget}, servingApmApplicationId } = get(data, 'actor.entity');
        const browserSettingsUrl = `https://rpm.newrelic.com/accounts/${entity.accountId}/browser/${servingApmApplicationId}/edit#/settings`;
        const apmService = get(data, 'actor.entity.relationships[0].source.entity');
        if (apmService) {
            apmService.iconType = getIconType(apmService);
        }
        //console.debug("Data", [data, results]);
        return <Grid className="breakdownContainer">
        <GridItem columnSpan={12}>
          <SummaryBar {...this.props.nerdletUrlState} apmService={apmService}/>
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
                    <span className="value">{results.satisfied.avgSessionLength} secs.*</span>
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
                    <span className="value">{results.tolerated.avgSessionLength} secs.*</span>
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
                        <span className="value">{results.frustrated.avgSessionLength} secs.*</span>
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
            <h3 className="cohortTitle">Improvements</h3>
            <p className="cohortDescription">Moving <em>Tolerated</em> and <em>Frustrated</em> sessions to <em>Satisfied</em> and assuming no change in the Satisfied <em>Bounce Rate</em> or <em>Avg. Session</em> length.</p>
            <div className="cohortStats improvementStats">
              <div className="cohortStat">
                  <span className="label">Engaged Sessions</span>
                  <span className="value">{results.recommendations.engagedSessions}</span>
              </div>
              <div className="cohortStat">
                  <span className="label">Added Page Views</span>
                  <span className="value">{results.recommendations.additionalPageViews}</span>
              </div>
              <div className="cohortStat">
                  <span className="label">Added Time on Site</span>
                  <span className="value">{results.recommendations.additionalTime}</span>
              </div>
              <div className="cohortStat">
                  <span className="label">Load Time Savings</span>
                  <span className="value">{results.recommendations.loadTimeSavings}</span>
              </div>
            </div>
          </GridItem>
        {pageUrl ? null : <GridItem className="pageUrlTable" columnSpan={8}>
            <HeadingText type={HeadingText.TYPE.HEADING3}>Top Performance Improvement Targets</HeadingText>
            <TableChart
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
