import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'nr1';
import Breakdown from '../../component/breakdown';

export default class MyNerdlet extends React.Component {
  static propTypes = {
    nerdletUrlState: PropTypes.object.isRequired,
    platformUrlState: PropTypes.object.isRequired,
    entity: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      hidden: true,
    };
    //console.debug(this.props);
    this.callbacks = {
      editClick: this.editClick.bind(this),
      onEditClose: this.onEditClose.bind(this),
    };
  }

  editClick() {
    this.setState({ hidden: false });
  }

  onEditClose() {
    this.setState({ hidden: true });
  }

  render() {
    const { hidden } = this.state;
    return (
      <React.Fragment>
        <Breakdown {...this.props} />
        <Modal hidden={hidden} onClose={this.callbacks.onEditClose}></Modal>
      </React.Fragment>
    );
  }
}
