import React from 'react';
import Details from './details';
import { NerdletStateContext } from 'nr1';

export default class Wrapper extends React.PureComponent {
  render() {
    return (
      <NerdletStateContext.Consumer>
        {nerdletUrlState => <Details nerdletUrlState={nerdletUrlState} />}
      </NerdletStateContext.Consumer>
    );
  }
}
