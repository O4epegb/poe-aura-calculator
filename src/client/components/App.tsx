import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { Routes } from '../../routes';
import { NotFoundPage } from './RouterComponents';
import { MainPage } from './MainPage';
import { ErrorBoundary } from './ErrorBoundary';

export const App = () => (
    <ErrorBoundary>
        <Switch>
            <Route exact path={Routes.index} component={MainPage} />
            <Route component={NotFoundPage} />
        </Switch>
    </ErrorBoundary>
);
