import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Stack, StackItem, SparklineChart, BillboardChart, HeadingText } from 'nr1';

export default class SummaryBar extends Component {
  static propTypes = {
    entity: PropTypes.object.isRequired,
    duration: PropTypes.number.isRequired,
    pageUrl: PropTypes.string
  }

  render() {
    //get props, including nested props
    const { pageUrl, entity: { accountId, name }, duration } = this.props;
    //compute the duration in minutes
    const durationInMinutes = duration/1000/60;

    // break the url up into separate piece so we can style them differently
    const protocol = pageUrl.split('/').filter((piece, i) => i < 2 && piece).toString() + '//';
    const domain = pageUrl.split('/').filter((piece, i) => i === 2 && piece).join('/');
    let path = pageUrl.split('/').filter((piece, i) => i > 2 && piece).join('/')
    path = '/' + path;

    //generate the appropriate NRQL where fragment for countryCode and regionCode
    //output a series of micro-charts to show overall KPI's

    return (
      <React.Fragment>
        {
          pageUrl && <HeadingText className="pageUrl">
              <span className="pageUrlProtocol">{protocol}</span>
              <span className="pageUrlDomain">{domain}</span>
              <span className="pageUrlPath">{path}</span>
            </HeadingText>
        }
        <Stack
          alignmentType={Stack.ALIGNMENT_TYPE.FILL}
          directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
          gapType={Stack.GAP_TYPE.TIGHT}
      >
          <StackItem className="inline">
            <HeadingText className="summaryBarTitle" type={HeadingText.TYPE.HEADING4}>Performance Analysis</HeadingText>
          </StackItem>
          <StackItem className="inline">
              <BillboardChart className="microchart" accountId={accountId} query={`FROM PageView SELECT count(*) as 'Page Views' SINCE ${durationInMinutes} MINUTES AGO WHERE appName = '${name}'`}/>
              <SparklineChart className="microchart" accountId={accountId} query={`FROM PageView SELECT count(*) TIMESERIES SINCE ${durationInMinutes} MINUTES AGO WHERE appName = '${name}'`}/>
          </StackItem>
          <StackItem className="inline">
              <BillboardChart className="microchart" accountId={accountId} query={`FROM PageView SELECT average(duration) as 'Avg. Perf.' SINCE ${durationInMinutes} MINUTES AGO WHERE appName = '${name}'`}/>
              <SparklineChart className="microchart" accountId={accountId} query={`FROM PageView SELECT average(duration) TIMESERIES SINCE ${durationInMinutes} MINUTES AGO WHERE appName = '${name}'`}/>
          </StackItem>
          <StackItem className="inline">
              <BillboardChart className="microchart" accountId={accountId} query={`FROM PageView SELECT average(networkDuration) as 'Network Avg.' SINCE ${durationInMinutes} MINUTES AGO WHERE appName = '${name}'`}/>
              <SparklineChart className="microchart" accountId={accountId} query={`FROM PageView SELECT average(networkDuration) TIMESERIES SINCE ${durationInMinutes} MINUTES AGO WHERE appName = '${name}'`}/>
          </StackItem>
          <StackItem className="inline" grow>
              <BillboardChart className="microchart" accountId={accountId} query={`FROM PageView SELECT average(backendDuration) as 'Backend Avg.' SINCE ${durationInMinutes} MINUTES AGO WHERE appName = '${name}'`}/>
              <SparklineChart className="microchart" accountId={accountId} query={`FROM PageView SELECT average(backendDuration) TIMESERIES SINCE ${durationInMinutes} MINUTES AGO WHERE appName = '${name}'`}/>
          </StackItem>
        </Stack>
      </React.Fragment>
    )
  }
}
