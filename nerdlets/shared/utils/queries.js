export const generateCohortsQuery = ({ entity, pageUrl, timePickerRange }) => {
  const apdexTarget = entity.settings.apdexTarget || 0.5; // TO DO - Should we set a default value?
  const frustratedApdex = Math.round(apdexTarget * 4 * 10) / 10;
  const facetCase = `FACET CASES( WHERE duration <= ${apdexTarget} AS 'S', WHERE duration > ${apdexTarget} AND duration < ${frustratedApdex} AS 'T', WHERE duration >= ${frustratedApdex} AS 'F')`;

  const graphql = `{
    actor {
      account(id: ${entity.accountId}) {
        cohorts: nrql(query: "FROM PageView SELECT uniqueCount(session) as 'sessions', count(*)/uniqueCount(session) as 'avgPageViews', median(duration) as 'medianDuration', percentile(duration, 75, 95,99), count(*) WHERE appName='${
          entity.name
        }' ${
    pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''
  } ${facetCase} ${timePickerRange}  ") {
          results
          totalResult
        }
        ${
          pageUrl
            ? `bounceRate:nrql(query: "FROM PageView SELECT funnel(session, ${
                pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''
              } as 'page', ${
                pageUrl ? `WHERE pageUrl != '${pageUrl}'` : ''
              } as 'nextPage') ${facetCase}") {
            results
        }`
            : ''
        }
        satisfied: nrql(query: "FROM PageView SELECT count(*), (max(timestamp)-min(timestamp)) as 'sessionLength' WHERE appName='${
          entity.name
        }' AND duration <= ${apdexTarget} ${
    pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''
  } FACET session limit MAX ${timePickerRange}") {
          results
        }
        tolerated: nrql(query: "FROM PageView SELECT count(*), (max(timestamp)-min(timestamp)) as 'sessionLength' WHERE appName='${
          entity.name
        }' AND duration > ${apdexTarget} AND duration < ${frustratedApdex} ${
    pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''
  } FACET session limit MAX ${timePickerRange}") {
          results
        }
        frustrated: nrql(query: "FROM PageView SELECT count(*), (max(timestamp)-min(timestamp)) as 'sessionLength' WHERE appName='${
          entity.name
        }' AND duration >= ${frustratedApdex} ${
    pageUrl ? `WHERE pageUrl = '${pageUrl}'` : ''
  } FACET session limit MAX ${timePickerRange}") {
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

  return graphql;
};
