import React from 'react';
import PropTypes from 'prop-types';

import { Icon } from 'nr1';

import styles from './styles.scss';

const _defaultDetails = function ({ error }) {
  // eslint-disable-next-line no-unused-vars
  const { graphQLErrors, message, stack } = error;
  return (
    <ul className={styles['ng-error-item-contents']}>
      <li className={styles['ng-error-item-contents-item']}>
        <span className={styles.key}>Stack</span>
        <span className={styles.value}>{JSON.stringify(stack)}</span>
      </li>
      {graphQLErrors.length > 0 &&
        graphQLErrors.map((gqlError, i) => {
          if (gqlError) {
            return (
              <li key={i} className={styles['ng-error-item-contents-item']}>
                <span className={styles.key}>{`GraphQL Error ${i + 1}`}:</span>
                <span className={styles.value}>{gqlError.message}</span>
              </li>
            );
          }
          return null;
        })}
    </ul>
  );
};
_defaultDetails.propTypes = {
  error: PropTypes.object,
};

export class NerdGraphError extends React.Component {
  static propTypes = {
    error: PropTypes.object,
    showDetails: PropTypes.bool,
    errorDetails: PropTypes.func,
  };

  static defaultProps = {
    showDetails: true,
    errorDetails: _defaultDetails,
  };

  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
    };
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.setState((prevState) => ({
      expanded: !prevState.expanded,
    }));
  }

  render() {
    const { error, showDetails, errorDetails } = this.props;
    const { expanded } = this.state;

    // eslint-disable-next-line no-unused-vars
    const { graphQLErrors, message, stack } = error;

    const open = expanded ? styles['ng-error-item-expanded'] : '';

    return (
      <div className={[styles['ng-error-container'], open].join(' ')}>
        <div className={styles['ng-error-body-header']} onClick={this.onClick}>
          {/* TO DO - Display a count of graphql Errors? */}
          <Icon type={Icon.TYPE.INTERFACE__STATE__CRITICAL} color="#bf0015" />
          <h5 className={styles['ng-error-title']}>{message}</h5>
          {showDetails && (
            <a href="#" className={styles['ng-error-details-button']}>
              {expanded ? 'Hide details' : 'View details'}
            </a>
          )}
        </div>
        {showDetails && (
          <div className={styles['ng-error-details']}>
            {errorDetails({ error })}
          </div>
        )}
      </div>
    );
  }
}
