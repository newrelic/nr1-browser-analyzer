import React from 'react';
import PropTypes from 'prop-types';
import { RadioGroup, Radio } from 'nr1';
import NrqlFactory from '../nrql-factory';

export default class MeasureToggle extends React.PureComponent {
  static propTypes = {
    setBrowserAppMeasures: PropTypes.func.isRequired,
    nrqlFactory: PropTypes.instanceOf(NrqlFactory).isRequired,
    entity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
  }

  render() {
    const { nrqlFactory, setBrowserAppMeasures, entity } = this.props;
    return (
      <RadioGroup
        defaultValue={nrqlFactory.getType()}
        onChange={(event, value) => {
          // console.debug([event, value]);
          const options = { entityGuid: entity.guid };
          setBrowserAppMeasures(value, options);
        }}
      >
        <Radio label="Page Views" value="PAGEVIEW" />
        <Radio label="Single Page App" value="SPA" />
      </RadioGroup>
    );
  }
}
