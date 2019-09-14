import React from 'react';
import PropTypes from 'prop-types';
import Breakdown from '../../component/breakdown';

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

export default class Details extends React.Component {
  static propTypes = {
    nerdletUrlState: PropTypes.object,
  };

  constructor(props) {
    super(props);
  }

  render() {
    return <Breakdown {...this.props} />;
  }
}
