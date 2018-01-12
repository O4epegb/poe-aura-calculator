import * as path from 'path';
import * as fs from 'fs';
import * as rfs from 'rotating-file-stream';
import * as morgan from 'morgan';
// import * as React from 'react';
// import { Provider } from 'mobx-react';
// import * as ReactDOMServer from 'react-dom/server';
import * as express from 'express';
import * as compression from 'compression';
// import { StaticRouter } from 'react-router';

// import { App as AppComponent } from '../client/components/App';
// import { RouterContext } from '../models';
import { logDev, logError } from './utils';
// import { getRouteData } from './getRouteData';

const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 8080;

const app = express();

app.set('port', port);
app.set('x-powered-by', false);

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (isProduction) {
    const logDirectory = path.resolve(__dirname, './logs');

    fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

    const accessLogStream = rfs('access.log', {
        interval: '1d',
        path: logDirectory,
        maxSize: '1G'
    });

    app.use(morgan('combined', { stream: accessLogStream }));
    app.use(morgan('tiny'));
}

app.use('/static', express.static(path.resolve(__dirname, './static')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.use('/env', (req, res, next) => {
    res.json({
        env: process.env
    });
});

// function getAppString(url: string, context: RouterContext, mainStore) {
//     return ReactDOMServer.renderToString(
//         <Provider stores={{ mainStore }}>
//             <StaticRouter location={url} context={context}>
//                 <AppComponent />
//             </StaticRouter>
//         </Provider>
//     );
// }

function getHtml(appString: string, initialState) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>hi</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <link href="https://fonts.googleapis.com/css?family=Roboto:400,500&amp;subset=cyrillic-ext" rel="stylesheet">
            <link href="https://fonts.googleapis.com/css?family=Roboto+Condensed:700&amp;subset=cyrillic" rel="stylesheet">
            <link rel="stylesheet" href="/static/client.css">
            <script src="/static/client.js" defer></script>
        </head>
        <body>
            ${
                initialState
                    ? `
            <script type="text/javascript">
                window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
            </script>
            `
                    : ''
            }
            <div id="root">${appString}</div>
        </body>
        </html>`;
}

app.use(async (req, res, next) => {
    return res.send(getHtml('', {}));

    // const context: RouterContext = {};

    // try {
    //     const { initialState, store } = await getRouteData(req, res, next);

    //     const appString = getAppString(req.url, context, store);
    //     const html = getHtml(appString, initialState);

    //     const { status } = context;

    //     if (status) {
    //         res.status(status);
    //     }

    //     res.send(html);
    // } catch (err) {
    //     logError(err);
    //     next(err);
    // }
});

app.use((err, req, res, next) => {
    logError(err);

    res.status(500).send('Server error. Try again later.');
});

app.listen(port, () => {
    logDev(`process.env.NODE_ENV: ${process.env.NODE_ENV || 'Unknown (defaults to "development")'}`);
    logDev(`Server started at ${isProduction ? 'port ' : 'http://localhost:'}${port}`);
});
