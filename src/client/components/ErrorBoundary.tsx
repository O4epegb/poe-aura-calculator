import * as React from 'react';

export class ErrorBoundary extends React.Component<{}, { error: any }> {
    constructor(props) {
        super(props);
        this.state = {
            error: null
        };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error });
    }

    render() {
        if (this.state.error) {
            return (
                <div className="snap">
                    <p>Something went wrong</p>
                </div>
            );
        } else {
            return this.props.children as any;
        }
    }
}
