import React from 'react';
import { get } from 'lodash';
import { BASE_NERDGRAPH_QUERY } from '../utils/queries';
import {
  Icon,
  nerdlet,
  NerdletStateContext,
  NerdGraphQuery,
  Spinner
} from 'nr1';

import { NerdGraphError, EmptyState } from '@newrelic/nr1-community';

import { HelpModal, Messages } from '@newrelic/nr-labs-components';

import NrqlFactory from '../nrql-factory';
import Breakdown from './breakdown';

export default class Wrapper extends React.PureComponent {
  state = {
    helpModalOpen: false
  };

  componentDidMount() {
    nerdlet.setConfig({
      actionControls: true,
      actionControlButtons: [
        {
          label: 'Help',
          hint: 'Quick links to get support',
          type: 'primary',
          iconType: Icon.TYPE.INTERFACE__INFO__HELP,
          onClick: () => this.setHelpModalOpen(true)
        }
      ]
    });
  }

  setHelpModalOpen = helpModalOpen => {
    this.setState({ helpModalOpen });
  };

  render() {
    const { helpModalOpen } = this.state;

    return (
      <>
        <Messages repo="nr1-browser-analyzer" branch="main" />
        <NerdletStateContext.Consumer>
          {nerdletUrlState => {
            return (
              <NerdGraphQuery
                query={BASE_NERDGRAPH_QUERY}
                variables={{ entityGuid: nerdletUrlState.entityGuid }}
                fetchPolicyType={NerdGraphQuery.FETCH_POLICY_TYPE.NO_CACHE}
              >
                {({ data, loading, error }) => {
                  if (loading) {
                    return <Spinner fillContainer />;
                  }

                  if (error) {
                    return <NerdGraphError error={error} />;
                  }
                  // console.debug(data);
                  const entity = get(data, 'actor.entity');
                  if (entity) {
                    const nrqlFactory = NrqlFactory.getFactory(data);
                    return (
                      <Breakdown
                        entity={entity}
                        nrqlFactory={nrqlFactory}
                        nerdletUrlState={nerdletUrlState}
                      />
                    );
                  } else {
                    return (
                      <div className="empty-state-container">
                        <EmptyState
                          heading="Site Analyzer is not available"
                          description="You have access to this entity, but Site Analyzer is not
                            enabled for Browser entities in this account. Please see
                            your Nerdpack Manager with concerns."
                          buttonText=""
                        />
                      </div>
                    );
                  }
                }}
              </NerdGraphQuery>
            );
          }}
        </NerdletStateContext.Consumer>
        <HelpModal
          isModalOpen={helpModalOpen}
          setModalOpen={this.setHelpModalOpen}
          urls={{
            docs: 'https://github.com/newrelic/nr1-browser-analyzer#readme',
            createIssue:
              'https://github.com/newrelic/nr1-browser-analyzer/issues/new?assignees=&labels=bug%2C+needs-triage&template=bug_report.md&title=',
            createFeature:
              'https://github.com/newrelic/nr1-browser-analyzer/issues/new?assignees=&labels=enhancement%2C+needs-triage&template=enhancement.md&title=',
            createQuestion:
              'https://github.com/newrelic/nr1-browser-analyzer/discussions/new/choose'
          }}
          ownerBadge={{
            logo: {
              src:
                'https://drive.google.com/uc?id=1BdXVy2X34rufvG4_1BYb9czhLRlGlgsT',
              alt: 'New Relic Labs'
            },
            blurb: {
              text: 'This is a New Relic Labs open source app.',
              link: {
                text: 'Take a look at our other repos',
                url:
                  'https://github.com/newrelic?q=nrlabs-viz&type=all&language=&sort='
              }
            }
          }}
        />
      </>
    );
  }
}
