import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BlockText, Grid, GridItem, Icon, HeadingText, TableChart, Spinner, NerdGraphQuery, navigation } from 'nr1';
import SummaryBar from './summary-bar';
import numeral from 'numeral';
import moment from 'moment';

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
        apdexT,
        entity
      } })
  }

  _buildResults({ cohorts, satisfied, tolerated, frustrated }) {
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
        engagedSessions: numeral(engagedSessions).format("0,0"),
        additionalPageViews: numeral(additionalPageViews).format("0,0"),
        additionalTime: moment(additionalTime).format('H:mm:ss'),
        loadTimeSavings: moment(loadTimeSavings).format('H:mm:ss'),
    }
    return obj;
}

  render() {
    const { pageUrl, duration, apdexT, entity } = this.props.nerdletUrlState;
    const durationInMinutes = duration/1000/60;
    const graphql = `{
      actor {
        account(id: ${entity.accountId}) {
          cohorts: nrql(query: "FROM PageView SELECT uniqueCount(session) as 'sessions', count(*)/uniqueCount(session) as 'avgPageViews', median(duration) as 'medianDuration', percentile(duration, 75, 95,99), count(*) WHERE appName='${entity.name}' ${pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''} FACET nr.apdexPerfZone SINCE ${durationInMinutes} MINUTES AGO") {
            results
            totalResult
          }
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
      }
    }`;
    console.debug("Graphql", graphql);
    return (
      <Grid>
        <GridItem columnSpan={12}>
          <SummaryBar {...this.props.nerdletUrlState} />
        </GridItem>
        <GridItem className="row" columnSpan={12}>
            <NerdGraphQuery query={graphql}>
              {({data, loading, error}) => {
                if (loading) {
                  return <Spinner fillContainer />
                }
                if (error) {
                  return <BlockText>{JSON.stringify(error)}</BlockText>
                }
                const results = this._buildResults(data.actor.account);
                console.debug("Data", [data, results]);
                return <React.Fragment>
                  <ul className="cohorts">
                    <li className="satisfied">
                        <Icon className="icon"
                          type={Icon.TYPE.PROFILES__EVENTS__LIKE}
                          color="green"
                        />
                        <ul className="stats">
                          <li><span className="label">Sessions</span>{results.satisfied.sessions}</li>
                          <li><span className="label">Pgs / Session</span>{results.satisfied.avgPageViews}</li>
                          <li><span className="label">Bounce Rate</span>{results.satisfied.bounceRate}%*</li>
                          <li><span className="label">Avg. Session</span>{results.satisfied.avgSessionLength}*</li>
                          <li className="wide">
                            <span className="label">Load Times</span>
                            <ul>
                              <li><span className="label">Median</span>{results.satisfied.medianDuration}</li>
                              <li><span className="label">75th</span>{results.satisfied.duration75}</li>
                              <li><span className="label">95th</span>{results.satisfied.duration95}</li>
                              <li><span className="label">99th</span>{results.satisfied.duration99}</li>
                            </ul>
                          </li>
                        </ul>
                    </li>
                    <li className="tolerated">
                        <Icon className="icon"
                          type={Icon.TYPE.INTERFACE__STATE__WARNING}
                          color="#CCCC00"
                        />
                        <ul className="stats">
                          <li><span className="label">Sessions</span>{results.tolerated.sessions}</li>
                          <li><span className="label">Pgs / Session</span>{results.tolerated.avgPageViews}</li>
                          <li><span className="label">Bounce Rate</span>{results.tolerated.bounceRate}%*</li>
                          <li><span className="label">Avg. Session</span>{results.tolerated.avgSessionLength}*</li>
                          <li className="wide">
                            <span className="label">Load Times</span>
                            <ul>
                              <li><span className="label">Median</span>{results.tolerated.medianDuration}</li>
                              <li><span className="label">75th</span>{results.tolerated.duration75}</li>
                              <li><span className="label">95th</span>{results.tolerated.duration95}</li>
                              <li><span className="label">99th</span>{results.tolerated.duration99}</li>
                            </ul>
                          </li>
                        </ul>
                    </li>
                    <li className="frustrated">
                        <Icon className="icon"
                          type={Icon.TYPE.INTERFACE__STATE__CRITICAL}
                          color="red"
                        />
                        <ul className="stats">
                          <li><span className="label">Sessions</span>{results.frustrated.sessions}</li>
                          <li><span className="label">Pgs / Session</span>{results.frustrated.avgPageViews}</li>
                          <li><span className="label">Bounce Rate</span>{results.frustrated.bounceRate}%*</li>
                          <li><span className="label">Avg. Session</span>{results.frustrated.avgSessionLength}*</li>
                          <li className="wide">
                            <span className="label">Load Times</span>
                            <ul>
                              <li><span className="label">Median</span>{results.frustrated.medianDuration}</li>
                              <li><span className="label">75th</span>{results.frustrated.duration75}</li>
                              <li><span className="label">95th</span>{results.frustrated.duration95}</li>
                              <li><span className="label">99th</span>{results.frustrated.duration99}</li>
                            </ul>
                          </li>
                        </ul>
                    </li>
                    <li>
                      <HeadingText>Business Impacts</HeadingText>
                      <BlockText>Estimated business improvements produced by performance improvements.</BlockText>
                      <ul className="stats">
                        <li className="wide"><span className="label">Engaged Sessions</span>{results.recommendations.engagedSessions}</li>
                        <li className="wide"><span className="label">Added Page Views</span>{results.recommendations.additionalPageViews}</li>
                        <li className="wide"><span className="label">Additional Time on Site</span>{results.recommendations.additionalTime}</li>
                        <li className="wide"><span className="label">Load Time Savings</span>{results.recommendations.loadTimeSavings}</li>
                      </ul>
                    </li>
                </ul>
                <BlockText style={{ marginLeft: '50px'}}>* Note that these calculations are approximations based on a sample of the total data in New Relic for this Browser application.</BlockText>
              </React.Fragment>
            }}
          </NerdGraphQuery>
        </GridItem>
        {pageUrl ? null : <GridItem className="pageUrlTable" columnSpan={12}>
            <HeadingText type={HeadingText.TYPE.HEADING3}>Top Performance Improvement Targets</HeadingText>
            <TableChart
                accountId={entity.accountId}
                query={`FROM PageView SELECT count(*) as 'Page Count', average(duration) as 'Avg. Duration', apdex(duration, ${apdexT}) as 'Apdex' WHERE appName='${entity.name}' AND nr.apdexPerfZone in ('F', 'T') FACET pageUrl LIMIT 100 SINCE ${durationInMinutes} MINUTES AGO `}
                onClickTable={(...args) => {
                    //console.debug(args);
                    this._openDetails(args[1].pageUrl);
                }}
            />
        </GridItem>}
      </Grid>
    )
  }
}
