import React from 'react';
import PropTypes from 'prop-types';
import { EntityByGuidQuery, BlockText, Grid, GridItem, NrqlQuery, Icon, HeadingText, TableChart, Spinner, Modal, NerdGraphQuery } from 'nr1';
import { get } from 'lodash';
import SummaryBar from './summary-bar';
import numeral from 'numeral';

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
        obj.satisfied.bounceRate = parseFloat((obj.satisfied.bounces/obj.satisfied.totalSamples)*100).toFixed(2);
        obj.satisfied.avgSessionLength = parseFloat(obj.satisfied.totalSessionLength/obj.satisfied.totalSamples).toFixed(2);

        obj.tolerated.bounceRate = parseFloat((obj.tolerated.bounces/obj.tolerated.totalSamples)*100).toFixed(2);
        obj.tolerated.avgSessionLength = parseFloat(obj.tolerated.totalSessionLength/obj.tolerated.totalSamples).toFixed(2);

        obj.frustrated.bounceRate = parseFloat((obj.frustrated.bounces/obj.frustrated.totalSamples)*100).toFixed(2);
        obj.frustrated.avgSessionLength = parseFloat(obj.frustrated.totalSessionLength/obj.frustrated.totalSamples).toFixed(2);
        return obj;
    }

    //Icon.TYPE.PROFILES__EVENTS__LIKE
    //Icon.TYPE.INTERFACE__STATE__WARNING
    //Icon.TYPE.INTERFACE__STATE__CRITICAL
    //macro cohort FROM PageView SELECT uniqueCount(session) WHERE appName='WebPortal' FACET buckets(duration, 6, 3)
    //FROM PageView SELECT count(*) as 'pageCount', average(duration) as 'avgDuration', apdex(duration, ${apdexT}) WHERE appName='${entity.name}' FACET pageUrl LIMIT 100
    render() {
        const { entityGuid } = this.props.nerdletUrlState;
        const { apdexT, bucketCeiling, hidden, percentage } = this.state;
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
                        cohorts: nrql(query: "FROM PageView SELECT uniqueCount(session) as 'sessions', count(*)/uniqueCount(session) as 'avgPageViews', median(duration) as 'medianDuration', percentile(duration, 75, 95,99) WHERE appName='${entity.name}' FACET nr.apdexPerfZone SINCE ${durationInMinutes} MINUTES AGO") {
                          results
                          totalResult
                        }
                        satisfied: nrql(query: "FROM PageView SELECT count(*), (max(timestamp)-min(timestamp))/1000 as 'sessionLength' WHERE appName='${entity.name}' AND nr.apdexPerfZone = 'S' FACET session limit MAX SINCE ${durationInMinutes} MINUTES AGO") {
                          results
                        }
                        tolerated: nrql(query: "FROM PageView SELECT count(*), (max(timestamp)-min(timestamp))/1000 as 'sessionLength' WHERE appName='${entity.name}' AND nr.apdexPerfZone = 'T' FACET session limit MAX SINCE ${durationInMinutes} MINUTES AGO") {
                          results
                        }
                        frustrated: nrql(query: "FROM PageView SELECT count(*), (max(timestamp)-min(timestamp))/1000 as 'sessionLength' WHERE appName='${entity.name}' AND nr.apdexPerfZone = 'F' FACET session limit MAX SINCE ${durationInMinutes} MINUTES AGO") {
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
                        <GridItem className="row" columnSpan={11}>
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
                                    return <React.Fragment><div className="cohorts">
                                        <div className="cohort satisfied">
                                            <Icon className="icon"
                                                type={Icon.TYPE.PROFILES__EVENTS__LIKE}
                                                color="green"
                                            />
                                            <h3 className="cohortTitle">Satisfied</h3>
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
                                                    <span className="label">Bounce Rate</span>
                                                    <span className="value">{results.satisfied.bounceRate}%*</span>
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
                                        </div>
                                        <div className="cohort tolerated">
                                            <Icon className="icon"
                                                type={Icon.TYPE.INTERFACE__STATE__WARNING}
                                                color="#F5A020"
                                            />
                                            <h3 className="cohortTitle">Tolerated</h3>
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
                                                    <span className="label">Bounce Rate</span>
                                                    <span className="value">{results.tolerated.bounceRate}%*</span>
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
                                        </div>
                                        <div className="cohort frustrated">
                                            <Icon className="icon"
                                                type={Icon.TYPE.INTERFACE__STATE__CRITICAL}
                                                color="red"
                                            />
                                            <h3 className="cohortTitle">Frustrated</h3>
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
                                                    <span className="label">Bounce Rate</span>
                                                    <span className="value">{results.frustrated.bounceRate}%*</span>
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
                                        </div>
                                    </div>
                                    <BlockText style={{ marginLeft: '50px'}}>* Note that these calculations are approximations based on a sample of the total data in New Relic for this Browser application.</BlockText>
                                    </React.Fragment>
                                }}
                            </NerdGraphQuery>
                        </GridItem>
                        <GridItem columnSpan={1}>
                            <HeadingText>Improve</HeadingText>
                            <input type="radio" name="improvement" />
                        </GridItem>
                        <GridItem className="pageUrlTable" columnSpan={12}>
                            <HeadingText type={HeadingText.TYPE.HEADING3}>Top Performance Improvement Targets</HeadingText>
                            <TableChart
                                accountId={entity.accountId}
                                query={`FROM PageView SELECT count(*) as 'Page Count', average(duration) as 'Avg. Duration', apdex(duration, ${apdexT}) as 'Apdex' WHERE appName='${entity.name}' AND nr.apdexPerfZone in ('F', 'T') FACET pageUrl LIMIT 100 SINCE ${durationInMinutes} MINUTES AGO `}
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