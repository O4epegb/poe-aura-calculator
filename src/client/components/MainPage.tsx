import * as React from 'react';
import { observer, inject } from 'mobx-react';

import { Stores } from '../../models';

interface State {}

interface Props {
    stores: Stores;
}

@inject('stores')
@observer
export class MainPage extends React.Component<Props, State> {
    render() {
        return <div>hi</div>;
    }
}
