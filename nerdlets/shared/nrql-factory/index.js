import { timeRangeToNrql } from '../utils/timeRangeToNrql';
import { get } from 'lodash';

/**
 * Generate the NRQL for a given type of Browser application, traditional or single page app
 */
export default class NrqlFactory {
  static getFactory(data) {
    // console.debug(data);
    const hasSpa = get(data, 'actor.entity.spa.results[0].count');
    if (hasSpa > 0) {
      return new SPAFactory();
    } else {
      return new PageViewFactory();
    }
  }

  constructor() {
    if (this.constructor === 'NrqlFactory') {
      throw new TypeError(
        'Abstract class "NrqlFactory" cannot be instantiated.'
      );
    }
    if (this.getType === undefined) {
      throw new TypeError('NrqlFactory classes must implement getType');
    }
    if (this.getPerformanceTargets === undefined) {
      throw new TypeError(
        'NrqlFactory classes must implement getPerformanceTargets'
      );
    }
    if (this.getQuery1 === undefined) {
      throw new TypeError('NrqlFactory classes must implement getQuery1');
    }
    if (this.getQuery2 === undefined) {
      throw new TypeError('NrqlFactory classes must implement getQuery2');
    }
    if (this.getQuery3 === undefined) {
      throw new TypeError('NrqlFactory classes must implement getQuery3');
    }
    if (this.getQuery4 === undefined) {
      throw new TypeError('NrqlFactory classes must implement getQuery4');
    }
    if (this.getCohortGraphQL === undefined) {
      throw new TypeError(
        'NrqlFactory classes must implement getCohortGraphQL'
      );
    }
  }
}

class PageViewFactory extends NrqlFactory {
  constructor() {
    super();
  }

  getType() {
    return 'PAGEVIEW';
  }

  getPerformanceTargets(options) {
    const { timeNrqlFragment, platformUrlState, entity, apdexTarget } = options;
    const timeFragment = timeNrqlFragment || timeRangeToNrql(platformUrlState);
    return `FROM PageView SELECT count(*) as 'Page Count', average(duration) as 'Avg. Duration', apdex(duration, ${apdexTarget}) as 'Apdex' WHERE entityGuid = '${entity.guid}' AND nr.apdexPerfZone in ('F', 'T') FACET pageUrl LIMIT 100 ${timeFragment}`;
  }

  getQuery1(options) {
    const { timeNrqlFragment, platformUrlState, entity, pageUrl, timeseries } =
      options;
    const timeFragment = timeNrqlFragment || timeRangeToNrql(platformUrlState);
    return `FROM PageView SELECT count(*) as 'Page Views' ${timeFragment}  WHERE entityGuid = '${
      entity.guid
    }' ${pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''} ${
      timeseries ? 'TIMESERIES' : ''
    }`;
  }

  getQuery2(options) {
    const { timeNrqlFragment, platformUrlState, entity, pageUrl, timeseries } =
      options;
    const timeFragment = timeNrqlFragment || timeRangeToNrql(platformUrlState);
    return `FROM PageView SELECT average(duration) as 'Avg. Performance' ${timeFragment}  WHERE entityGuid = '${
      entity.guid
    }' ${pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''} ${
      timeseries ? 'TIMESERIES' : ''
    }`;
  }

  getQuery3(options) {
    const { timeNrqlFragment, platformUrlState, entity, pageUrl, timeseries } =
      options;
    const timeFragment = timeNrqlFragment || timeRangeToNrql(platformUrlState);
    return `FROM PageView SELECT average(networkDuration) as 'Avg. Network' ${timeFragment}  WHERE entityGuid = '${
      entity.guid
    }' ${pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''} ${
      timeseries ? 'TIMESERIES' : ''
    }`;
  }

  getQuery4(options) {
    const { timeNrqlFragment, platformUrlState, entity, pageUrl, timeseries } =
      options;
    const timeFragment = timeNrqlFragment || timeRangeToNrql(platformUrlState);
    return `FROM PageView SELECT average(backendDuration) as 'Avg. Backend' ${timeFragment}  WHERE entityGuid = '${
      entity.guid
    }' ${pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''} ${
      timeseries ? 'TIMESERIES' : ''
    }`;
  }

  getCohortGraphQL(options) {
    const {
      pageUrl,
      entity,
      facetCaseStmt,
      platformUrlState,
      timeNrqlFragment,
      apdexTarget,
      frustratedApdex,
    } = options;
    const timeFragment = timeNrqlFragment || timeRangeToNrql(platformUrlState);
    const graphql = `{
      actor {
        account(id: ${entity.accountId}) {
          cohorts: nrql(query: "FROM PageView SELECT uniqueCount(session) as 'sessions', count(*)/uniqueCount(session) as 'avgPageViews', median(duration) as 'medianDuration', percentile(duration, 75, 95,99), count(*) WHERE entityGuid='${
            entity.guid
          }' ${
      pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''
    } ${facetCaseStmt} ${timeFragment}  ") {
            results
            totalResult
          }
          ${
            pageUrl
              ? `bounceRate:nrql(query: "FROM PageView SELECT funnel(session, ${
                  pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''
                } as 'page', ${
                  pageUrl ? `WHERE pageUrl != '${pageUrl}'` : ''
                } as 'nextPage') ${facetCaseStmt}") {
              results
          }`
              : ''
          }
          satisfied: nrql(query: "FROM PageView SELECT count(*), (max(timestamp)-min(timestamp)) as 'sessionLength' WHERE entityGuid='${
            entity.guid
          }' AND duration <= ${apdexTarget} ${
      pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''
    } FACET session limit MAX ${timeFragment}") {
            results
          }
          tolerated: nrql(query: "FROM PageView SELECT count(*), (max(timestamp)-min(timestamp)) as 'sessionLength' WHERE entityGuid='${
            entity.guid
          }' AND duration > ${apdexTarget} AND duration < ${frustratedApdex} ${
      pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''
    } FACET session limit MAX ${timeFragment}") {
            results
          }
          frustrated: nrql(query: "FROM PageView SELECT count(*), (max(timestamp)-min(timestamp)) as 'sessionLength' WHERE entityGuid='${
            entity.guid
          }' AND duration >= ${frustratedApdex} ${
      pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''
    } FACET session limit MAX ${timeFragment}") {
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
          relatedEntities {
            results {
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
      }
    }`;
    return graphql;
  }
}

class SPAFactory extends NrqlFactory {
  constructor() {
    super();
  }

  getType() {
    return 'SPA';
  }

  getPerformanceTargets(options) {
    const { timeNrqlFragment, platformUrlState, entity, apdexTarget } = options;
    const timeFragment = timeNrqlFragment || timeRangeToNrql(platformUrlState);
    return `FROM BrowserInteraction SELECT count(*) as 'Page Count', average(duration) as 'Avg. Duration', apdex(duration, ${apdexTarget}) as 'Apdex' WHERE entityGuid='${entity.guid}' FACET targetUrl LIMIT 100 ${timeFragment}`;
  }

  getQuery1(options) {
    const {
      timeNrqlFragment,
      platformUrlState,
      entity,
      targetUrl,
      timeseries,
    } = options;
    const timeFragment = timeNrqlFragment || timeRangeToNrql(platformUrlState);
    return `FROM BrowserInteraction SELECT count(*) as 'Page Views' ${timeFragment}  WHERE entityGuid = '${
      entity.guid
    }' ${targetUrl ? `WHERE targetUrl = '${targetUrl}'` : ''} ${
      timeseries ? 'TIMESERIES' : ''
    }`;
  }

  getQuery2(options) {
    const {
      timeNrqlFragment,
      platformUrlState,
      entity,
      targetUrl,
      timeseries,
    } = options;
    const timeFragment = timeNrqlFragment || timeRangeToNrql(platformUrlState);
    return `FROM BrowserInteraction SELECT percentile(duration, 50) as 'Avg. Duration' ${timeFragment}  WHERE entityGuid = '${
      entity.guid
    }' ${targetUrl ? `WHERE targetUrl = '${targetUrl}'` : ''} ${
      timeseries ? 'TIMESERIES' : ''
    }`;
  }

  getQuery3(options) {
    const {
      timeNrqlFragment,
      platformUrlState,
      entity,
      targetUrl,
      timeseries,
    } = options;
    const timeFragment = timeNrqlFragment || timeRangeToNrql(platformUrlState);
    return `FROM PageViewTiming SELECT percentile(firstContentfulPaint, 50) as 'First Contentful Paint' ${timeFragment}  WHERE entityGuid = '${
      entity.guid
    }' ${targetUrl ? `WHERE targetUrl = '${targetUrl}'` : ''} ${
      timeseries ? 'TIMESERIES' : ''
    }`;
  }

  getQuery4(options) {
    const {
      timeNrqlFragment,
      platformUrlState,
      entity,
      targetUrl,
      timeseries,
    } = options;
    const timeFragment = timeNrqlFragment || timeRangeToNrql(platformUrlState);
    return `FROM PageViewTiming SELECT percentile(firstInteraction, 50) as 'First Interaction' ${timeFragment}  WHERE entityGuid = '${
      entity.guid
    }' ${targetUrl ? `WHERE targetUrl = '${targetUrl}'` : ''} ${
      timeseries ? 'TIMESERIES' : ''
    }`;
  }

  getCohortGraphQL(options) {
    const {
      targetUrl,
      entity,
      facetCaseStmt,
      platformUrlState,
      timeNrqlFragment,
      apdexTarget,
      frustratedApdex,
    } = options;
    const timeFragment = timeNrqlFragment || timeRangeToNrql(platformUrlState);
    const graphql = `{
      actor {
        account(id: ${entity.accountId}) {
          cohorts: nrql(query: "FROM BrowserInteraction SELECT uniqueCount(session) as 'sessions', count(*)/uniqueCount(session) as 'avgPageViews', median(duration) as 'medianDuration', percentile(duration, 75, 95,99), count(*) WHERE entityGuid='${
            entity.guid
          }' ${
      targetUrl ? `WHERE targetUrl = '${targetUrl}'` : ''
    } ${facetCaseStmt} ${timeFragment}  ") {
            results
            totalResult
          }
          ${
            targetUrl
              ? `bounceRate:nrql(query: "FROM BrowserInteraction SELECT funnel(session, ${
                  targetUrl ? `WHERE targetUrl = '${targetUrl}'` : ''
                } as 'page', ${
                  targetUrl ? `WHERE targetUrl != '${targetUrl}'` : ''
                } as 'nextPage') ${facetCaseStmt}") {
              results
          }`
              : ''
          }
          satisfied: nrql(query: "FROM BrowserInteraction SELECT count(*), (max(timestamp)-min(timestamp)) as 'sessionLength' WHERE entityGuid='${
            entity.guid
          }' AND duration <= ${apdexTarget} ${
      targetUrl ? `WHERE targetUrl = '${targetUrl}'` : ''
    } FACET session limit MAX ${timeFragment}") {
            results
          }
          tolerated: nrql(query: "FROM BrowserInteraction SELECT count(*), (max(timestamp)-min(timestamp)) as 'sessionLength' WHERE entityGuid='${
            entity.guid
          }' AND duration > ${apdexTarget} AND duration < ${frustratedApdex} ${
      targetUrl ? `WHERE targetUrl = '${targetUrl}'` : ''
    } FACET session limit MAX ${timeFragment}") {
            results
          }
          frustrated: nrql(query: "FROM BrowserInteraction SELECT count(*), (max(timestamp)-min(timestamp)) as 'sessionLength' WHERE entityGuid='${
            entity.guid
          }' AND duration >= ${frustratedApdex} ${
      targetUrl ? `WHERE targetUrl = '${targetUrl}'` : ''
    } FACET session limit MAX ${timeFragment}") {
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
          relatedEntities {
            results {
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
      }
    }`;
    return graphql;
  }
}
