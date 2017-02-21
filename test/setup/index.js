import path from 'path';
import { Application } from 'spectron';

const appPath = path.resolve(__dirname, '../../');
const electronPath = path.resolve(__dirname, '../../node_modules/.bin/electron');

function startApplication() {
    const app = new Application({
        path: electronPath,
        args: [appPath],
    });
    return app.start()
        .then(() => expect(app.isRunning()).toEqual(true))
        .then(() => app);
}

function stopApplication(app) {
    if (!app || !app.isRunning()) return Promise.resolve();

    return app.stop()
        .then(() => expect(app.isRunning()).toEqual(false));
}


export default {
    startApplication,
    stopApplication,
};
