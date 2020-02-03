import React from 'react';
import PropTypes from 'prop-types';

import { Icon } from 'nr1';

const CohortSatisifed = function({
  results,
  pageUrl,
  browserSettingsUrl,
  apdexTarget
}) {
  return (
    <>
      <Icon
        className="icon"
        type={Icon.TYPE.PROFILES__EVENTS__LIKE}
        color="green"
      />
      <h3 className="cohortTitle">Satisfied</h3>
      <p className="cohortDescription">
        <em>Satisfied</em> performance based on an{' '}
        <a href={browserSettingsUrl} target="seldon">
          apdex T of <em>{apdexTarget}</em>
        </a>
        .
      </p>
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
          <span className="label">
            {!pageUrl ? 'Bounce Rate' : 'Exit Rate'}
          </span>
          <span className="value">
            {results.satisfied.bounceRate}%{!pageUrl ? '*' : ''}
          </span>
        </div>
        <div className="cohortStat">
          <span className="label">Avg. Session</span>
          <span className="value">{results.satisfied.avgSessionLength}*</span>
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
    </>
  );
};

CohortSatisifed.propTypes = {
  results: PropTypes.object,
  pageUrl: PropTypes.string,
  browserSettingsUrl: PropTypes.string,
  apdexTarget: PropTypes.number
};

export default CohortSatisifed;
