import React from 'react';
import PropTypes from 'prop-types';
import { EntityByGuidQuery, BlockText, Spinner, Modal } from 'nr1';
import { get } from 'lodash';
import Breakdown from '../../component/breakdown';

export default class MyNerdlet extends React.Component {
  static propTypes = {
    nerdletUrlState: PropTypes.object,
    launcherUrlState: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      apdexT: 2.0,
      bucketCeiling: 6,
      hidden: true,
      percentage: 0,
    };
    //console.debug(this.props);
    this.callbacks = {
      editClick: this.editClick.bind(this),
      onEditClose: this.onEditClose.bind(this),
    };
    this.cohorts = [];
  }

  editClick() {
    this.setState({ hidden: false });
  }

  onEditClose() {
    this.setState({ hidden: true });
  }

  render() {
    const {
      nerdletUrlState: { entityGuid },
      launcherUrlState: {
        timeRange: { duration },
      },
    } = this.props;
    const { hidden, apdexT } = this.state;
    return (
      <EntityByGuidQuery entityGuid={entityGuid}>
        {({ loading, error, data }) => {
          // console.debug(data);
          if (loading) {
            return <Spinner />;
          }
          if (error) {
            return <BlockText>{error.message}</BlockText>;
          }
          const entity = get(data, 'entities[0]');
          //console.debug("Entity", entity);
          const nerdletUrlState = { duration, apdexT, entity };
          return (
            <React.Fragment>
              <Breakdown nerdletUrlState={nerdletUrlState} />
              <Modal
                hidden={hidden}
                onClose={this.callbacks.onEditClose}
              ></Modal>
            </React.Fragment>
          );
        }}
      </EntityByGuidQuery>
    );
  }
}
