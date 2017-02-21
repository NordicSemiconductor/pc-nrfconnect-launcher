import { startApplication, stopApplication } from './setup';
import packageJson from '../package.json';

let app;

describe('application', () => {
    beforeEach(() => (
        startApplication()
            .then(application => {
                app = application;
            })
    ));

    afterEach(() => (
        stopApplication(app)
    ));

    it('should open two windows', () => (
        app.client.getWindowCount()
            .then(windowCount => expect(windowCount).toEqual(2))
    ));

    it('should display splash screen image in first window', () => (
        app.client.windowByIndex(0).isVisible('div[style*=\'splashScreen.png\']')
            .then(isSplashVisible => expect(isSplashVisible).toEqual(true))
    ));

    it('should show package.json version in main window title', () => (
        app.client.windowByIndex(1).browserWindow.getTitle()
            .then(title => expect(title).toContain(packageJson.version))
    ));
});
