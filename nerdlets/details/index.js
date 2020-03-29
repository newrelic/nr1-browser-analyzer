import React from 'react';
import gql from 'graphql-tag';
import {
  PlatformStateContext,
  NerdletStateContext,
  EntityByGuidQuery,
  HeadingText,
  BlockText,
  Spinner
} from 'nr1';
import { NerdGraphError } from '@newrelic/nr1-community';
import Breakdown from '../shared/components/breakdown';

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
              if (!nerdletUrlState.entityGuid) {
                return null;
              }

              return (
                <EntityByGuidQuery
                  entityGuid={nerdletUrlState.entityGuid}
                  entityFragmentExtension={fragment}
                >
                  {({ data, loading, error }) => {
                    if (loading) {
                      return <Spinner fillContainer />;
                    }

                    if (error) {
                      return <NerdGraphError error={error} />
                    }

                    if (
                      data.entities &&
                      data.entities[0] &&
                      data.entities[0].guid
                    ) {
                      return (
                        <Breakdown
                          platformUrlState={platformUrlState}
                          nerdletUrlState={nerdletUrlState}
                          entity={data.entities[0]}
                        />
                      );
                    }

                    return (
                      <div className="message">
                        <HeadingText>
                          Site Analyzer is not available
                        </HeadingText>
                        <BlockText>
                          You have access to this entity, but Site Analyzer is
                          not enabled for Browser entities in this account.
                          Please see your Nerdpack Manager with concerns.
                        </BlockText>
                      </div>
                    );
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
