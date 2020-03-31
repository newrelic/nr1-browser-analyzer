import React from 'react';
import PropTypes from 'prop-types';

import {
  Stack,
  StackItem,
  SparklineChart,
  BillboardChart,
  HeadingText,
  navigation,
  Button,
  ChartGroup,
  PlatformStateContext,
  NerdletStateContext
} from 'nr1';

import { splitPageUrl } from '../utils';
import { timeRangeToNrql } from '@newrelic/nr1-community';

export default class SummaryBar extends React.PureComponent {
  static propTypes = {
    entity: PropTypes.object.isRequired,
    apmService: PropTypes.object
  };

  render() {
    const {
      entity: { accountId, name },
      apmService
    } = this.props;

    // generate the appropriate NRQL where fragment for countryCode and regionCode
    // output a series of micro-charts to show overall KPI's

    return (
      <PlatformStateContext.Consumer>
        {platformUrlState => (
          <NerdletStateContext.Consumer>
            {nerdletUrlState => {
              const { pageUrl } = nerdletUrlState;
              const timePickerRange = timeRangeToNrql(platformUrlState);
              const { protocol, domain, path } = splitPageUrl({ pageUrl });

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
                        query={`FROM PageView SELECT count(*) as 'Page Views' ${timePickerRange}  WHERE appName = '${name}' ${
                          pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''
                        }`}
                      />
                    </StackItem>
                    <StackItem>
                      <SparklineChart
                        className="microchart wider"
                        accountId={accountId}
                        query={`FROM PageView SELECT count(*) TIMESERIES ${timePickerRange}  WHERE appName = '${name}' ${
                          pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''
                        }`}
                      />
                    </StackItem>
                    <StackItem>
                      <BillboardChart
                        className="microchart"
                        accountId={accountId}
                        query={`FROM PageView SELECT average(duration) as 'Avg. Performance' ${timePickerRange}  WHERE appName = '${name}' ${
                          pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''
                        }`}
                      />
                    </StackItem>
                    <StackItem>
                      <SparklineChart
                        className="microchart wider"
                        accountId={accountId}
                        query={`FROM PageView SELECT average(duration) TIMESERIES ${timePickerRange}  WHERE appName = '${name}' ${
                          pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''
                        }`}
                      />
                    </StackItem>
                    <StackItem>
                      <BillboardChart
                        className="microchart"
                        accountId={accountId}
                        query={`FROM PageView SELECT average(networkDuration) as 'Network Avg.' ${timePickerRange}  WHERE appName = '${name}' ${
                          pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''
                        }`}
                      />
                    </StackItem>
                    <StackItem>
                      <SparklineChart
                        className="microchart wider"
                        accountId={accountId}
                        query={`FROM PageView SELECT average(networkDuration) TIMESERIES ${timePickerRange}  WHERE appName = '${name}' ${
                          pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''
                        }`}
                      />
                    </StackItem>
                    <StackItem>
                      <BillboardChart
                        className="microchart"
                        accountId={accountId}
                        query={`FROM PageView SELECT average(backendDuration) as 'Backend Avg.' ${timePickerRange}  WHERE appName = '${name}' ${
                          pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''
                        }`}
                      />
                    </StackItem>
                    <StackItem className="wider">
                      <SparklineChart
                        className="microchart wider"
                        accountId={accountId}
                        query={`FROM PageView SELECT average(backendDuration) TIMESERIES ${timePickerRange} WHERE appName = '${name}' ${
                          pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''
                        }`}
                      />
                    </StackItem>
                    {apmService && (
                      <StackItem grow className="summaryEnd">
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
                      </StackItem>
                    )}
                  </Stack>
                </ChartGroup>
              );
            }}
          </NerdletStateContext.Consumer>
        )}
      </PlatformStateContext.Consumer>
    );
  }
}
