import numeral from 'numeral';
import prettyMilliseconds from 'pretty-ms';

const durationFormat = (value) => {
  const formatted = prettyMilliseconds(value);

  return formatted;
};

function calcTotalSessionLength(a) {
  let accumulator = 0;
  a.forEach((result) => {
    accumulator += parseFloat(result.sessionLength);
  });
  return accumulator;
}

function calcBounces(a) {
  let accumulator = 0;
  a.forEach((result) => {
    const count = parseInt(result.count);
    if (count === 1) {
      accumulator++;
    }
  });
  return accumulator;
}

const baseCohort = {
  sessions: 0,
  pageviews: 0,
  medianDuration: 0,
  avgPageViews: 0,
  duration75: 0,
  duration95: 0,
  duration99: 0,
  totalSessionLength: 0,
  totalSamples: 0,
  bounces: 0,
  bounceRate: 0,
  avgSessionLength: 0,
};

function buildSatisfied(cohorts, satisfied, bounceRate) {
  const obj = { ...baseCohort };
  obj.raw = {};
  const SbounceRate = !bounceRate
    ? null
    : bounceRate.rawResponse.facets.find((r) => r.name === 'S');
  const S =
    cohorts && cohorts.results
      ? cohorts.results.find((c) => c.facet === 'S')
      : null;
  fillObject(obj, satisfied, S, SbounceRate);
  return obj;
}

function buildTolerated(cohorts, tolerated, bounceRate) {
  const obj = { ...baseCohort };
  obj.raw = {};
  const TbounceRate = !bounceRate
    ? null
    : bounceRate.rawResponse.facets.find((r) => r.name === 'T');
  const T =
    cohorts && cohorts.results
      ? cohorts.results.find((c) => c.facet === 'T')
      : null;
  fillObject(obj, tolerated, T, TbounceRate);
  return obj;
}

function buildFrustrated(cohorts, frustrated, bounceRate) {
  const obj = { ...baseCohort };
  obj.raw = {};
  const FbounceRate = !bounceRate
    ? null
    : bounceRate.rawResponse.facets.find((r) => r.name === 'F');
  const F =
    cohorts && cohorts.results
      ? cohorts.results.find((c) => c.facet === 'F')
      : null;
  fillObject(obj, frustrated, F, FbounceRate);
  return obj;
}

function fillObject(obj, sample, cohort, bounceCohort) {
  if (cohort) {
    obj.raw.cohort = { ...cohort };
    obj.sessions = numeral(cohort.sessions).format('0,0');
    obj.pageviews = cohort.pageviews;
    obj.medianDuration = parseFloat(cohort.medianDuration['50']).toFixed(2);
    obj.avgPageViews = parseFloat(cohort.avgPageViews).toFixed(2);
    obj.duration75 = parseFloat(cohort['percentile.duration']['75']).toFixed(2);
    obj.duration95 = parseFloat(cohort['percentile.duration']['95']).toFixed(2);
    obj.duration99 = parseFloat(cohort['percentile.duration']['99']).toFixed(2);
  }

  if (sample) {
    obj.raw.sample = { ...sample };
    obj.totalSessionLength = calcTotalSessionLength(sample.results);
    obj.totalSamples = sample.results.length;
    obj.bounces = calcBounces(sample.results);
  }

  if (bounceCohort && bounceCohort.results && bounceCohort.results.length > 0) {
    bounceCohort = bounceCohort.results[0];
    if (bounceCohort.steps) {
      obj.raw.bounceCohort = { ...bounceCohort };
      obj.bounces = bounceCohort.steps[0] - bounceCohort.steps[1];
      obj.totalSamples = bounceCohort.steps[0];
    }
  }
  
  return obj;
}

function buildRecommendations(obj) {
  const recommendations = {};
  recommendations.rawAvgPageViews = [0, 0, 0];
  if (obj.satisfied.raw.cohort && obj.satisfied.raw.cohort.avgPageViews) {
    recommendations.rawAvgPageViews[0] = obj.satisfied.raw.cohort.avgPageViews;
  }
  if (obj.tolerated.raw.cohort && obj.tolerated.raw.cohort.avgPageViews) {
    recommendations.rawAvgPageViews[1] = obj.tolerated.raw.cohort.avgPageViews;
  }
  if (obj.frustrated.raw.cohort && obj.frustrated.raw.cohort.avgPageViews) {
    recommendations.rawAvgPageViews[2] = obj.frustrated.raw.cohort.avgPageViews;
  }

  recommendations.rawBounceRate = [
    obj.satisfied.totalSamples === 0
      ? 0
      : obj.satisfied.bounces / obj.satisfied.totalSamples,
    obj.tolerated.totalSamples === 0
      ? 0
      : obj.tolerated.bounces / obj.tolerated.totalSamples,
    obj.frustrated.totalSamples === 0
      ? 0
      : obj.frustrated.bounces / obj.frustrated.totalSamples,
  ];
  recommendations.retentionRate = [
    recommendations.rawBounceRate[0] === 0
      ? null
      : 1.0 - recommendations.rawBounceRate[0],
    recommendations.rawBounceRate[1] === 0
      ? null
      : 1.0 - recommendations.rawBounceRate[1],
    recommendations.rawBounceRate[2] === 0
      ? null
      : 1.0 - recommendations.rawBounceRate[2],
  ];
  recommendations.rawSessionLength = [
    obj.satisfied.totalSamples === 0
      ? 0
      : obj.satisfied.totalSessionLength / obj.satisfied.totalSamples,
    obj.tolerated.totalSamples === 0
      ? 0
      : obj.tolerated.totalSessionLength / obj.tolerated.totalSamples,
    obj.frustrated.totalSamples === 0
      ? 0
      : obj.frustrated.totalSessionLength / obj.frustrated.totalSamples,
  ];
  recommendations.rawEngagedSessions = [0, 0];
  if (obj.tolerated.raw.cohort && obj.tolerated.raw.cohort.sessions) {
    recommendations.rawEngagedSessions[0] = Math.round(
      obj.tolerated.raw.cohort.sessions *
        (recommendations.rawBounceRate[1] - recommendations.rawBounceRate[0])
    );
  }
  if (obj.frustrated.raw.cohort && obj.frustrated.raw.cohort.sessions) {
    recommendations.rawEngagedSessions[1] = Math.round(
      obj.frustrated.raw.cohort.sessions *
        (recommendations.rawBounceRate[2] - recommendations.rawBounceRate[0])
    );
  }

  // satisfied
  obj.satisfied.bounceRate =
    recommendations.rawBounceRate[0] === 0
      ? 0
      : parseFloat(recommendations.rawBounceRate[0] * 100).toFixed(2);
  obj.satisfied.avgSessionLength =
    recommendations.rawSessionLength[0] === 0
      ? 0
      : durationFormat(recommendations.rawSessionLength[0]);
  // tolerated
  obj.tolerated.bounceRate =
    recommendations.rawBounceRate[1] === 0
      ? 0
      : parseFloat(recommendations.rawBounceRate[1] * 100).toFixed(2);
  obj.tolerated.avgSessionLength =
    recommendations.rawSessionLength[1] === 0
      ? 0
      : durationFormat(recommendations.rawSessionLength[1]);
  // frustrated
  obj.frustrated.bounceRate =
    recommendations.rawBounceRate[2] === 0
      ? 0
      : parseFloat(recommendations.rawBounceRate[2] * 100).toFixed(2);
  obj.frustrated.avgSessionLength =
    recommendations.rawSessionLength[2] === 0
      ? 0
      : durationFormat(recommendations.rawSessionLength[2]);

  // NOW, we can calculate some recommendations
  recommendations.engagedSessions =
    recommendations.rawEngagedSessions[0] +
    recommendations.rawEngagedSessions[1];

  recommendations.additionalPageViews =
    recommendations.engagedSessions * recommendations.rawAvgPageViews[0] -
    recommendations.rawEngagedSessions[0] * recommendations.rawAvgPageViews[1] -
    recommendations.rawEngagedSessions[1] * recommendations.rawAvgPageViews[2];

  recommendations.additionalTime =
    recommendations.engagedSessions * recommendations.rawSessionLength[0] -
    recommendations.rawEngagedSessions[0] *
      recommendations.rawSessionLength[1] -
    recommendations.rawEngagedSessions[1] * recommendations.rawSessionLength[2];

  recommendations.satisfiedDuration =
    obj.satisfied.raw.cohort && obj.satisfied.raw.cohort.medianDuration['50']
      ? obj.satisfied.raw.cohort.medianDuration['50']
      : 0;
  recommendations.toleratedDuration =
    obj.tolerated.raw.cohort && obj.tolerated.raw.cohort.medianDuration['50']
      ? obj.tolerated.raw.cohort.medianDuration['50']
      : 0;
  recommendations.frustratedDuration =
    obj.frustrated.raw.cohort && obj.frustrated.raw.cohort.medianDuration['50']
      ? obj.frustrated.raw.cohort.medianDuration['50']
      : 0;
  recommendations.toleratedCount =
    obj.tolerated.raw.cohort && obj.tolerated.raw.cohort.count
      ? obj.tolerated.raw.cohort.count
      : 0;
  recommendations.frustratedCount =
    obj.frustrated.raw.cohort && obj.frustrated.raw.cohort.count
      ? obj.frustrated.raw.cohort.count
      : 0;

  recommendations.loadTimeSavings =
    recommendations.toleratedCount *
      (recommendations.toleratedDuration - recommendations.satisfiedDuration) +
    recommendations.frustratedCount *
      (recommendations.frustratedDuration - recommendations.satisfiedDuration);

  recommendations.sessions =
    recommendations.engagedSessions > 0
      ? numeral(recommendations.engagedSessions).format('0,0')
      : 'N/A';
  recommendations.pageviews =
    recommendations.additionalPageViews > 0
      ? numeral(recommendations.additionalPageViews).format('0,0')
      : 'N/A';
  recommendations.siteTime =
    recommendations.additionalTime > 0
      ? durationFormat(
          recommendations.additionalTime / recommendations.engagedSessions
        )
      : 'N/A';
  recommendations.loadTime =
    recommendations.loadTimeSavings > 0
      ? durationFormat(recommendations.loadTimeSavings)
      : 'N/A';
  return recommendations;
}

export const buildResults = ({
  cohorts,
  satisfied,
  tolerated,
  frustrated,
  bounceRate,
}) => {
  const obj = {
    satisfied: buildSatisfied(cohorts, satisfied, bounceRate),
    tolerated: buildTolerated(cohorts, tolerated, bounceRate),
    frustrated: buildFrustrated(cohorts, frustrated, bounceRate),
  };
  obj.recommendations = buildRecommendations(obj);
  return obj;
};
