import React from 'react';
import Wrapper from '../shared/components/wrapper';
import { EntityStorageMutation } from 'nr1';

export default class BrowserAnalyzerNerdlet extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      browserAppMeasures: 'pageview'
    };
    this.setBrowserAppMeasures = this.setBrowserAppMeasures.bind(this);
  }

  async setBrowserAppMeasures(val, options) {
    const { entityGuid } = options;
    if (val === 'SPA') {
      await EntityStorageMutation.mutate({
        entityGuid,
        actionType: EntityStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
        collection: 'browser-analyzer-pref',
        documentId: 'browserAppMeasures',
        document: {
          value: 'SPA'
        }
      });
      this.setState({ browserAppMeasures: 'SPA' });
    } else {
      await EntityStorageMutation.mutate({
        entityGuid,
        actionType: EntityStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
        collection: 'browser-analyzer-pref',
        documentId: 'browserAppMeasures',
        document: {
          value: 'PAGEVIEW'
        }
      });
      this.setState({ browserAppMeasures: 'PAGEVIEW' });
    }
  }

  render() {
    const { browserAppMeasures } = this.state;
    return (
      <Wrapper
        setBrowserAppMeasures={this.setBrowserAppMeasures}
        browserAppMeasures={browserAppMeasures}
      />
    );
  }
}
