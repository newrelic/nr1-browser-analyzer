import React from 'react';
import PropTypes from 'prop-types';

import { Icon } from 'nr1';

const CohortImprovement = function ({ results }) {
  return (
    <>
      <Icon
        className="icon"
        type={Icon.TYPE.INTERFACE__CHEVRON__CHEVRON_TOP__V_ALTERNATE}
        color="green"
      />
      <h3 className="cohortTitle">Improvement Opportunities</h3>
      <p className="cohortDescription">
        Moving <em>Tolerated</em> and <em>Frustrated</em> sessions to{' '}
        <em>Satisfied</em> and assuming no change in the Satisfied{' '}
        <em>Bounce Rate</em> or <em>Avg. Session</em> length.
      </p>
      <div className="cohortStats improvementStats">
        <div className="cohortStat">
          <span className="label">Improved Sessions</span>
          <span className="value">{results.recommendations.sessions}</span>
        </div>
        <div className="cohortStat">
          <span className="label">Added Page Views</span>
          <span className="value">{results.recommendations.pageviews}</span>
        </div>
        <div className="cohortStat">
          <span className="label">Time / Improved Session</span>
          <span className="value">{results.recommendations.siteTime}</span>
        </div>
        <div className="cohortStat">
          <span className="label">Load Time Savings</span>
          <span className="value">{results.recommendations.loadTime}</span>
        </div>
      </div>
    </>
  );
};

CohortImprovement.propTypes = {
  results: PropTypes.object,
};

export default CohortImprovement;
