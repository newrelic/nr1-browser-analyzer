import React from 'react';
import MyNerdlet from './root';
import {
  PlatformStateContext,
  NerdletStateContext,
  EntityByGuidQuery,
  BlockText,
  Spinner
} from 'nr1';
import { EmptyState } from '@newrelic/nr1-community';
import gql from 'graphql-tag';

export default class Wrapper extends React.PureComponent {
  render() {
    const fragment = gql`
      fragment EntityFragmentExtension on EntityOutline {
        indexedAt
        guid
        ... on BrowserApplicationEntityOutline {
          settings {
            apdexTarget
          }
          applicationId
          servingApmApplicationId
        }
      }
    `;
    return (
      <PlatformStateContext.Consumer>
        {platformUrlState => (
          <NerdletStateContext.Consumer>
            {nerdletUrlState => {
              // console.log([nerdletUrlState, fragment]);
              return (
                <EntityByGuidQuery
                  entityGuid={nerdletUrlState.entityGuid}
                  entityFragmentExtension={fragment}
                >
                  {({ data, loading, error }) => {
                    // debugger;
                    if (loading) {
                      return <Spinner fillContainer />;
                    }
                    if (
                      data.entities &&
                      data.entities[0] &&
                      data.entities[0].guid
                    ) {
                      return (
                        <MyNerdlet
                          platformUrlState={platformUrlState}
                          nerdletUrlState={nerdletUrlState}
                          entity={data.entities[0]}
                        />
                      );
                    } else if (error) {
                      return <BlockText>{error.message}</BlockText>;
                    } else {
                      return (
                        <EmptyState
                          heading="Site Analyzer is not available"
                          description="You have access to this entity, but Site Analyzer is not
                        enabled for Browser entities in this account. Please see
                        your Nerdpack Manager with concerns."
                          buttonText=""
                        />
                      );
                    }
                  }}
                </EntityByGuidQuery>
              );
            }}
          </NerdletStateContext.Consumer>
        )}
      </PlatformStateContext.Consumer>
    );
  }
}
