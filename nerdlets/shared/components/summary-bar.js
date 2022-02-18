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
  PlatformStateContext
} from 'nr1';
import { splitPageUrl } from '../utils';
import { timeRangeToNrql } from '@newrelic/nr1-community';
import NrqlFactory from '../nrql-factory';

export default class SummaryBar extends React.PureComponent {
  static propTypes = {
    entity: PropTypes.object.isRequired,
    apmService: PropTypes.object,
    nrqlFactory: PropTypes.instanceOf(NrqlFactory).isRequired,
    nerdletUrlState: PropTypes.object.isRequired
  };

  render() {
    const {
      entity: { accountId },
      apmService,
      nerdletUrlState,
      nrqlFactory,
      entity
    } = this.props;

    // generate the appropriate NRQL where fragment for countryCode and regionCode
    // output a series of micro-charts to show overall KPI's

    return (
      <PlatformStateContext.Consumer>
        {platformUrlState => {
          const { pageUrl } = nerdletUrlState;
          const timePickerRange = timeRangeToNrql(platformUrlState);
          const { protocol, domain, path } = splitPageUrl({ pageUrl });
          const options = {
            entity,
            platformUrlState,
            timeNrqlFragment: timePickerRange,
            pageUrl
          };
          const optionTimeseries = {
            entity,
            platformUrlState,
            timeNrqlFragment: timePickerRange,
            pageUrl,
            timeseries: true
          };
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
                    accountIds={[accountId]}
                    query={nrqlFactory.getQuery1(options)}
                  />
                </StackItem>
                <StackItem>
                  <SparklineChart
                    className="microchart wider"
                    accountIds={[accountId]}
                    query={nrqlFactory.getQuery1(optionTimeseries)}
                  />
                </StackItem>
                <StackItem>
                  <BillboardChart
                    className="microchart"
                    accountIds={[accountId]}
                    query={nrqlFactory.getQuery2(options)}
                  />
                </StackItem>
                <StackItem>
                  <SparklineChart
                    className="microchart wider"
                    accountIds={[accountId]}
                    query={nrqlFactory.getQuery2(optionTimeseries)}
                  />
                </StackItem>
                <StackItem>
                  <BillboardChart
                    className="microchart"
                    accountIds={[accountId]}
                    query={nrqlFactory.getQuery3(options)}
                  />
                </StackItem>
                <StackItem>
                  <SparklineChart
                    className="microchart wider"
                    accountIds={[accountId]}
                    query={nrqlFactory.getQuery3(optionTimeseries)}
                  />
                </StackItem>
                <StackItem>
                  <BillboardChart
                    className="microchart"
                    accountIds={[accountId]}
                    query={nrqlFactory.getQuery4(options)}
                  />
                </StackItem>
                <StackItem className="wider">
                  <SparklineChart
                    className="microchart wider"
                    accountIds={[accountId]}
                    query={nrqlFactory.getQuery4(optionTimeseries)}
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
      </PlatformStateContext.Consumer>
    );
  }
}
