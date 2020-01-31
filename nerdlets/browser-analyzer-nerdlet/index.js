import React from 'react';

import { get } from 'lodash';
import gql from 'graphql-tag';

import {
  NerdletStateContext,
  EntityByGuidQuery,
  HeadingText,
  BlockText,
  Spinner
} from 'nr1';

import Breakdown from '../shared/components/breakdown';

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

export default class Wrapper extends React.PureComponent {
  render() {
    return (
      <NerdletStateContext.Consumer>
        {nerdletUrlState => {
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
                  return <BlockText>{error.message}</BlockText>;
                }

                const entity = get(data, 'entities[0]', false);
                if (entity) {
                  return <Breakdown entity={entity} />;
                }

                return (
                  <div className="message">
                    <HeadingText>Site Analyzer is not available</HeadingText>
                    <BlockText>
                      You have access to this entity, but Site Analyzer is not
                      enabled for Browser entities in this account. Please see
                      your Nerdpack Manager with concerns.
                    </BlockText>
                  </div>
                );
              }}
            </EntityByGuidQuery>
          );
        }}
      </NerdletStateContext.Consumer>
    );
  }
}
