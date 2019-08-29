import React from 'react';
import PropTypes from 'prop-types';
import { EntityByGuidQuery, BlockText, Grid, GridItem, NrqlQuery, Icon, HeadingText, TableChart, Spinner, Modal, NerdGraphQuery } from 'nr1';
import { get } from 'lodash';
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

export default class MyNerdlet extends React.Component {
    static propTypes = {
        nerdletUrlState: PropTypes.object,
        launcherUrlState: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = {
            apdexT: 2.0,
            bucketCeiling: 6,
            hidden: true,
            percentage: 0
        };
        console.debug(this.props);
        this.callbacks = {
            editClick: this.editClick.bind(this),
            onEditClose: this.onEditClose.bind(this)
        };
        this.cohorts = [];
    }

    editClick() {
        this.setState({hidden: false});
    }

    onEditClose() {
        this.setState({hidden: true});
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
        const rawBounceRate = obj.satisfied.bounces/obj.satisfied.totalSamples;
        const retentionRate = 1.0 - rawBounceRate;
        const rawSessionLength = obj.satisfied.totalSessionLength/obj.satisfied.totalSamples;

        obj.satisfied.bounceRate = parseFloat(rawBounceRate*100).toFixed(2);
        obj.satisfied.avgSessionLength = moment(rawSessionLength).format('m:ss');

        obj.tolerated.bounceRate = parseFloat((obj.tolerated.bounces/obj.tolerated.totalSamples)*100).toFixed(2);
        obj.tolerated.avgSessionLength = moment(obj.tolerated.totalSessionLength/obj.tolerated.totalSamples).format('m:ss');

        obj.frustrated.bounceRate = parseFloat((obj.frustrated.bounces/obj.frustrated.totalSamples)*100).toFixed(2);
        obj.frustrated.avgSessionLength = moment(obj.frustrated.totalSessionLength/obj.frustrated.totalSamples).format('m:ss');

        const engagedSessions = Math.round((F.sessions + T.sessions) * retentionRate);

        const additionalPageViews = (engagedSessions * S.avgPageViews);


        obj.recommendations = {
            engagedSessions,
            additionalPageViews
        }
        return obj;
    }

    //Icon.TYPE.PROFILES__EVENTS__LIKE
    //Icon.TYPE.INTERFACE__STATE__WARNING
    //Icon.TYPE.INTERFACE__STATE__CRITICAL
    //macro cohort FROM PageView SELECT uniqueCount(session) WHERE appName='WebPortal' FACET buckets(duration, 6, 3)
    //FROM PageView SELECT count(*) as 'pageCount', average(duration) as 'avgDuration', apdex(duration, ${apdexT}) WHERE appName='${entity.name}' FACET pageUrl LIMIT 100
    render() {
        const { entityGuid } = this.props.nerdletUrlState;
        const { apdexT, hidden } = this.state;
        const { duration } = this.props.launcherUrlState.timeRange;
        const durationInMinutes = duration/1000/60;
        return <EntityByGuidQuery entityGuid={entityGuid}>
            {({loading, error, data}) => {
                if (loading) {
                    return <Spinner fillContainer />
                }
                if (error) {
                    return <BlockText>{JSON.stringify(error)}</BlockText>
                }
                const entity = get(data, 'actor.entities[0]');
                console.debug("Entity", entity);
                const graphql = `{
                    actor {
                      account(id: ${entity.accountId}) {
                        cohorts: nrql(query: "FROM PageView SELECT uniqueCount(session) as 'sessions', count(*)/uniqueCount(session) as 'avgPageViews', median(duration) as 'medianDuration', percentile(duration, 75, 95,99), count(*) WHERE appName='${entity.name}' FACET nr.apdexPerfZone SINCE ${durationInMinutes} MINUTES AGO") {
                          results
                          totalResult
                        }
                        satisfied: nrql(query: "FROM PageView SELECT count(*), (max(timestamp)-min(timestamp)) as 'sessionLength' WHERE appName='${entity.name}' AND nr.apdexPerfZone = 'S' FACET session limit MAX SINCE ${durationInMinutes} MINUTES AGO") {
                          results
                        }
                        tolerated: nrql(query: "FROM PageView SELECT count(*), (max(timestamp)-min(timestamp)) as 'sessionLength' WHERE appName='${entity.name}' AND nr.apdexPerfZone = 'T' FACET session limit MAX SINCE ${durationInMinutes} MINUTES AGO") {
                          results
                        }
                        frustrated: nrql(query: "FROM PageView SELECT count(*), (max(timestamp)-min(timestamp)) as 'sessionLength' WHERE appName='${entity.name}' AND nr.apdexPerfZone = 'F' FACET session limit MAX SINCE ${durationInMinutes} MINUTES AGO") {
                          results
                        }
                      }
                    }
                  }`;
                console.debug(graphql);
                return <React.Fragment>
                    <Grid>
                        <GridItem columnSpan={12}>
                            <SummaryBar entity={entity} launcherUrlState={this.props.launcherUrlState} callbacks={this.callbacks} />
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
                                    return <React.Fragment><ul className="cohorts">
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
                                                <li className="wide"><span className="label">Load Times</span><ul>
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
                                                <li className="wide"><span className="label">Load Times</span><ul>
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
                                                <li className="wide"><span className="label">Load Times</span><ul>
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
                                            <BlockText>Performance improvements could produce the following additional outcomes.</BlockText>
                                            <ul>
                                                <li><span className="label">Engaged Sessions</span>{results.recommendations.engagedSessions}</li>
                                                <li><span className="label">Page Views</span>{results.recommendations.additionalPageViews}</li>
                                            </ul>
                                        </li>
                                    </ul>
                                    <BlockText style={{ marginLeft: '50px'}}>* Note that these calculations are approximations based on a sample of the total data in New Relic for this Browser application.</BlockText>
                                    </React.Fragment>
                                }}
                            </NerdGraphQuery>
                        </GridItem>
                        <GridItem className="pageUrlTable" columnSpan={12}>
                            <HeadingText type={HeadingText.TYPE.HEADING3}>Top Performance Improvement Targets</HeadingText>
                            <TableChart
                                accountId={entity.accountId}
                                query={`FROM PageView SELECT count(*) as 'Page Count', average(duration) as 'Avg. Duration', apdex(duration) as 'Apdex' WHERE appName='${entity.name}' AND nr.apdexPerfZone in ('F', 'T') FACET pageUrl LIMIT 100 SINCE ${durationInMinutes} MINUTES AGO `}
                            />
                        </GridItem>
                    </Grid>
                    <Modal hidden={hidden} onClose={this.callbacks.onEditClose}>

                    </Modal>
                </React.Fragment>
            }}
        </EntityByGuidQuery>
    }
}