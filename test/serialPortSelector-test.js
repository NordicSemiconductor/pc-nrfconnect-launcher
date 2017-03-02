import { startApplication, stopApplication } from './setup';

let app;

describe('port selector', () => {
    beforeEach(() => (
        startApplication()
            .then(application => {
                app = application;
            })
    ));

    afterEach(() => {
        stopApplication(app);
    });

    it('should show port list when port selector has been clicked', () => (
        app.client.windowByIndex(1)
            .click('#navbar-dropdown')
            .isVisible('.dropdown-menu')
            .then(isVisible => expect(isVisible).toEqual(true))
    ));
});
