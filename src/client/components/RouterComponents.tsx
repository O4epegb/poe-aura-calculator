import * as React from 'react';
import { Route } from 'react-router-dom';

export const Status = ({
    code,
    children
}: {
    code: number;
    children: JSX.Element;
}) => {
    return (
        <Route
            render={props => {
                const { staticContext } = props;
                if (staticContext) {
                    staticContext.status = code;
                }
                return children;
            }}
        />
    );
};

export const NotFoundPage = () => {
    return (
        <Status code={404}>
            <h2 className="not-found">Page not found</h2>
        </Status>
    );
};
