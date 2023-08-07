import React from 'react';
import PropTypes from 'prop-types';

import { Icon } from 'nr1';

const CohortTolerated = function ({
  results,
  browserSettingsUrl,
  pageUrl,
  apdexTarget,
}) {
  return (
    <>
      <Icon
        className="icon"
        type={Icon.TYPE.INTERFACE__STATE__WARNING}
        color="#F5A020"
      />
      <h3 className="cohortTitle">Tolerated</h3>
      <p className="cohortDescription">
        <em>Tolerated</em> performance based on an{' '}
        <a href={browserSettingsUrl} target="seldon">
          apdex T of <em>{apdexTarget}</em>
        </a>
        .
      </p>
      <div className="cohortStats toleratedStats">
        <div className="cohortStat">
          <span className="label">Sessions</span>
          <span className="value">{results.tolerated.sessions}</span>
        </div>
        <div className="cohortStat">
          <span className="label">Pgs / Session</span>
          <span className="value">{results.tolerated.avgPageViews}</span>
        </div>
        <div className="cohortStat">
          <span className="label">
            {!pageUrl ? 'Bounce Rate' : 'Exit Rate'}
          </span>
          <span className="value">
            {results.tolerated.bounceRate}%{!pageUrl ? '*' : ''}
          </span>
        </div>
        <div className="cohortStat">
          <span className="label">Avg. Session</span>
          <span className="value">{results.tolerated.avgSessionLength}*</span>
        </div>
        <div className="cohortWideSection">
          <h5 className="sectionTitle">Load Times</h5>
          <div className="cohortStat">
            <span className="label">Median</span>
            <span className="value">{results.tolerated.medianDuration}</span>
          </div>
          <div className="cohortStat">
            <span className="label">75th</span>
            <span className="value">{results.tolerated.duration75}</span>
          </div>
          <div className="cohortStat">
            <span className="label">95th</span>
            <span className="value">{results.tolerated.duration95}</span>
          </div>
          <div className="cohortStat">
            <span className="label">99th</span>
            <span className="value">{results.tolerated.duration99}</span>
          </div>
        </div>
      </div>
    </>
  );
};

CohortTolerated.propTypes = {
  results: PropTypes.object,
  pageUrl: PropTypes.string,
  browserSettingsUrl: PropTypes.string,
  apdexTarget: PropTypes.number,
};

export default CohortTolerated;
