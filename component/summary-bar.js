import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Stack,
  StackItem,
  SparklineChart,
  BillboardChart,
  HeadingText,
  navigation,
  Button,
  ChartGroup
} from 'nr1';
import timePicker from './timePicker';

export default class SummaryBar extends Component {
  static propTypes = {
    nerdletUrlState: PropTypes.object.isRequired,
    platformUrlState: PropTypes.object.isRequired,
    entity: PropTypes.object.isRequired,
    apmService: PropTypes.object
  };

  render() {
    // get props, including nested props
    const {
      nerdletUrlState: { pageUrl },
      entity: { accountId, name },
      platformUrlState,
      apmService
    } = this.props;
    // compute the duration in minutes/hours/days
    const timePickerRange = timePicker(platformUrlState.timeRange);

    // break the url up into separate piece so we can style them differently
    const protocol = pageUrl
      ? `${pageUrl
          .split('/')
          .filter((piece, i) => i < 2 && piece)
          .toString()}//`
      : null;
    const domain = pageUrl
      ? pageUrl
          .split('/')
          .filter((piece, i) => i === 2 && piece)
          .join('/')
      : null;
    let path = pageUrl
      ? pageUrl
          .split('/')
          .filter((piece, i) => i > 2 && piece)
          .join('/')
      : null;
    path = `/${path}`;

    // generate the appropriate NRQL where fragment for countryCode and regionCode
    // output a series of micro-charts to show overall KPI's

    return (
      <ChartGroup>
        {pageUrl && (
          <HeadingText className="pageUrl">
            <a
              href={protocol + domain + path}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="pageUrlProtocol">{protocol}</span>
              <span className="pageUrlDomain">{domain}</span>
              <span className="pageUrlPath">{path}</span>
            </a>
          </HeadingText>
        )}
        <Stack
          className="summaryBar"
          directionType={Stack.DIRECTION_TYPE.HORIZONTAL}
          gapType={Stack.GAP_TYPE.TIGHT}
        >
          <StackItem className="summaryTitle">
            <HeadingText type={HeadingText.TYPE.HEADING4}>
              Performance Analysis
            </HeadingText>
          </StackItem>
          <StackItem>
            <BillboardChart
              className="microchart"
              accountId={accountId}
              query={`FROM BrowserInteraction SELECT count(*) as 'Page Views' ${timePickerRange}  WHERE appName = '${name}' ${
                pageUrl ? `WHERE targetUrl = '${pageUrl}'` : ''
              }`}
            />
          </StackItem>
          <StackItem>
            <SparklineChart
              className="microchart wider"
              accountId={accountId}
              query={`FROM BrowserInteraction SELECT count(*) TIMESERIES ${timePickerRange}  WHERE appName = '${name}' ${
                pageUrl ? `WHERE targetUrl = '${pageUrl}'` : ''
              }`}
            />
          </StackItem>
          <StackItem>
            <BillboardChart
              className="microchart"
              accountId={accountId}
              query={`FROM BrowserInteraction SELECT average(duration) as 'Avg. Duration' ${timePickerRange}  WHERE appName = '${name}' ${
                pageUrl ? `WHERE targetUrl = '${pageUrl}'` : ''
              }`}
            />
          </StackItem>
          <StackItem>
            <SparklineChart
              className="microchart wider"
              accountId={accountId}
              query={`FROM BrowserInteraction SELECT average(duration) TIMESERIES ${timePickerRange}  WHERE appName = '${name}' ${
                pageUrl ? `WHERE targetUrl = '${pageUrl}'` : ''
              }`}
            />
          </StackItem>
          <StackItem>
            <BillboardChart
              className="microchart"
              accountId={accountId}
              query={`FROM PageViewTiming SELECT average(firstContentfulPaint) as 'First Contentful Paint' ${timePickerRange}  WHERE appName = '${name}' ${
                pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''
              }`}
            />
          </StackItem>
          <StackItem>
            <SparklineChart
              className="microchart wider"
              accountId={accountId}
              query={`FROM PageViewTiming SELECT average(firstContentfulPaint) TIMESERIES ${timePickerRange}  WHERE appName = '${name}' ${
                pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''
              }`}
            />
          </StackItem>
          <StackItem>
            <BillboardChart
              className="microchart"
              accountId={accountId}
              query={`FROM PageViewTiming SELECT average(firstInteraction) as 'First Interaction' ${timePickerRange}  WHERE appName = '${name}' ${
                pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''
              }`}
            />
          </StackItem>
          <StackItem className="wider">
            <SparklineChart
              className="microchart wider"
              accountId={accountId}
              query={`FROM PageViewTiming SELECT average(firstInteraction) TIMESERIES ${timePickerRange} WHERE appName = '${name}' ${
                pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''
              }`}
            />
          </StackItem>
          <StackItem grow className="summaryEnd">
            {apmService && (
              <Button
                className="apmButton"
                type={Button.TYPE.NORMAL}
                sizeType={Button.SIZE_TYPE.SLIM}
                onClick={() => {
                  navigation.openStackedEntity(apmService.guid);
                }}
                iconType={apmService.iconType}
              >
                Upstream Service
              </Button>
            )}
          </StackItem>
        </Stack>
      </ChartGroup>
    );
  }
}
