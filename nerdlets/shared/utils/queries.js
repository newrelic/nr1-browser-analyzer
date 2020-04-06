export const generateCohortsQuery = ({
  entity,
  pageUrl,
  timePickerRange,
  nrqlFactory
}) => {
  const apdexTarget = entity.settings.apdexTarget || 0.5; // TO DO - Should we set a default value?
  const frustratedApdex = Math.round(apdexTarget * 4 * 10) / 10;
  const facetCaseStmt = `FACET CASES( WHERE duration <= ${apdexTarget} AS 'S', WHERE duration > ${apdexTarget} AND duration < ${frustratedApdex} AS 'T', WHERE duration >= ${frustratedApdex} AS 'F')`;
  const options = {
    entity,
    pageUrl,
    targetUrl: pageUrl,
    apdexTarget,
    frustratedApdex,
    timeNrqlFragment: timePickerRange,
    facetCaseStmt
  };
  return nrqlFactory.getCohortGraphQL(options);
};

export const BASE_NERDGRAPH_QUERY = `query($entityGuid: String!) {
  actor {
    entity(guid: $entityGuid) {
      name
      indexedAt
      guid
      entityType
      domain
      ... on BrowserApplicationEntity {
        settings {
          apdexTarget
        }
        applicationId
        servingApmApplicationId
      }
      accountId
      pages: nrdbQuery(nrql: "SELECT count(*) FROM PageView SINCE 30 minutes ago") {
        results
        nrql
      }
      spa: nrdbQuery(nrql: "SELECT count(*) FROM BrowserInteraction SINCE 30 minutes ago") {
        results
        nrql
      }
      nerdStorage {
        collection(collection: "browser-analyzer-pref") {
          document
          id
        }
      }
    }
  }
}`;
