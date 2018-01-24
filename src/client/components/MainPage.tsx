import * as React from 'react';
import { observer, inject } from 'mobx-react';

interface State {}

interface Props {
    stores: any;
}

@inject('stores')
@observer
export class MainPage extends React.Component<Props, State> {
    render() {
        return <div>hi!</div>;
    }
}
