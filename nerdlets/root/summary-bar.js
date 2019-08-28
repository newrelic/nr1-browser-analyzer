import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Stack, StackItem, SparklineChart, BillboardChart, HeadingText, Button } from 'nr1';

export default class SummaryBar extends Component {
  static propTypes = {
    entity: PropTypes.object.isRequired,
    launcherUrlState: PropTypes.object.isRequired,
    callbacks: PropTypes.object.isRequired
  }

  render() {
    //get props, including nested props
    const { callbacks, entity: { accountId, name }, launcherUrlState: { timeRange: { duration } } } = this.props;
    //compute the duration in minutes
    const durationInMinutes = duration/1000/60;
    //generate the appropriate NRQL where fragment for countryCode and regionCode
    //output a series of micro-charts to show overall KPI's
    return (
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
          <StackItem className="inline">
              <BillboardChart className="microchart" accountId={accountId} query={`FROM PageView SELECT average(backendDuration) as 'Backend Avg.' SINCE ${durationInMinutes} MINUTES AGO WHERE appName = '${name}'`}/>
              <SparklineChart className="microchart" accountId={accountId} query={`FROM PageView SELECT average(backendDuration) TIMESERIES SINCE ${durationInMinutes} MINUTES AGO WHERE appName = '${name}'`}/>
          </StackItem>
          <StackItem className="inline"  grow={true}>
            <Button iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_EDIT} onClick={callbacks.editClick} type={Button.TYPE.NORMAL} style={{height: '30px',
    marginTop: '30px'}}>Configs</Button>
          </StackItem>
      </Stack>
    )
  }
}
