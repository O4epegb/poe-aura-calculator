import { matchPath } from 'react-router';

// import { Routes } from '../routes';
import { Request, Response, NextFunction } from './models';

const dataForRoutes = [];

type GetRouteData = Promise<{
    initialState: any;
    store: any;
}>;

export function getRouteData(
    req: Request,
    res: Response,
    next: NextFunction
): GetRouteData {
    for (let i = 0; i < dataForRoutes.length; i++) {
        const route = dataForRoutes[i];
        const match = matchPath(req.path, {
            exact: true,
            path: route.path
        });
        if (match) {
            return route.getData(req, res, next);
        }
    }
    return Promise.resolve({
        initialState: null,
        store: null
    });
}
