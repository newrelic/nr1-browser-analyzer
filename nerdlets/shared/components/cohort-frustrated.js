import React from 'react';
import PropTypes from 'prop-types';

import { Icon } from 'nr1';

const CohortFrustrated = function ({
  results,
  pageUrl,
  browserSettingsUrl,
  apdexTarget,
}) {
  return (
    <>
      <Icon
        className="icon"
        type={Icon.TYPE.INTERFACE__STATE__CRITICAL}
        color="red"
      />
      <h3 className="cohortTitle">Frustrated</h3>
      <p className="cohortDescription">
        <em>Frustrated</em> performance based on an{' '}
        <a href={browserSettingsUrl} target="seldon">
          apdex T of <em>{apdexTarget}</em>
        </a>
        .
      </p>
      <div className="cohortStats frustratedStats">
        <div className="cohortStat">
          <span className="label">Sessions</span>
          <span className="value">{results.frustrated.sessions}</span>
        </div>
        <div className="cohortStat">
          <span className="label">Pgs / Session</span>
          <span className="value">{results.frustrated.avgPageViews}</span>
        </div>
        <div className="cohortStat">
          <span className="label">
            {!pageUrl ? 'Bounce Rate' : 'Exit Rate'}
          </span>
          <span className="value">
            {results.frustrated.bounceRate}%{!pageUrl ? '*' : ''}
          </span>
        </div>
        <div className="cohortStat">
          <span className="label">Avg. Session</span>
          <span className="value">{results.frustrated.avgSessionLength}*</span>
        </div>
        <div className="cohortWideSection">
          <h5 className="sectionTitle">Load Times</h5>
          <div className="cohortStat">
            <span className="label">Median</span>
            <span className="value">{results.frustrated.medianDuration}</span>
          </div>
          <div className="cohortStat">
            <span className="label">75th</span>
            <span className="value">{results.frustrated.duration75}</span>
          </div>
          <div className="cohortStat">
            <span className="label">95th</span>
            <span className="value">{results.frustrated.duration95}</span>
          </div>
          <div className="cohortStat">
            <span className="label">99th</span>
            <span className="value">{results.frustrated.duration99}</span>
          </div>
        </div>
      </div>
    </>
  );
};

CohortFrustrated.propTypes = {
  results: PropTypes.object,
  pageUrl: PropTypes.string,
  browserSettingsUrl: PropTypes.string,
  apdexTarget: PropTypes.number,
};

export default CohortFrustrated;
