/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable import/first */

// Do not render react-bootstrap components in tests
jest.mock('react-bootstrap', () => ({
    Modal: 'Modal',
    Button: 'Button',
    ModalHeader: 'ModalHeader',
    ModalFooter: 'ModalFooter',
    ModalBody: 'ModalBody',
    ModalTitle: 'ModalTitle',
}));

jest.mock('../../containers/AppManagementFilterContainer', () => 'div');
jest.mock('../../containers/ReleaseNotesDialogContainer', () => 'div');

import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { List } from 'immutable';

import getImmutableApp from '../../models';
import AppManagementView from '../AppManagementView';

describe('AppManagementView', () => {
    it('should render without any apps', () => {
        expect(
            renderer.create(
                <AppManagementView
                    apps={List()}
                    isRetrievingApps={false}
                    onAppSelected={() => {}}
                    onCreateShortcut={() => {}}
                    onInstall={() => {}}
                    onRemove={() => {}}
                    onReadMore={() => {}}
                    onMount={() => {}}
                    onShowReleaseNotes={() => {}}
                    sources={{}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should render not-installed, installed, and upgradable apps', () => {
        expect(
            renderer.create(
                <AppManagementView
                    apps={List([
                        getImmutableApp({
                            name: 'appB',
                            displayName: 'App B',
                            description: 'appB description',
                        }),
                        getImmutableApp({
                            name: 'appC',
                            displayName: 'App C',
                            description: 'appC description',
                            currentVersion: '1.2.3',
                            latestVersion: '1.2.3',
                        }),
                        getImmutableApp({
                            name: 'appA',
                            displayName: 'App A',
                            description: 'appA description',
                            currentVersion: '1.2.3',
                            latestVersion: '1.2.4',
                        }),
                    ])}
                    isRetrievingApps={false}
                    onAppSelected={() => {}}
                    onCreateShortcut={() => {}}
                    onInstall={() => {}}
                    onRemove={() => {}}
                    onReadMore={() => {}}
                    onShowReleaseNotes={() => {}}
                    sources={{}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should disable buttons and display "Installing..." button text when installing app', () => {
        expect(
            renderer.create(
                <AppManagementView
                    apps={List([
                        getImmutableApp({
                            name: 'pc-nrfconnect-foo',
                            displayName: 'Foo app',
                            description: 'Foo description',
                            source: 'bar',
                        }),
                    ])}
                    isRetrievingApps={false}
                    installingAppName="bar/pc-nrfconnect-foo"
                    isProcessing
                    onAppSelected={() => {}}
                    onCreateShortcut={() => {}}
                    onInstall={() => {}}
                    onRemove={() => {}}
                    onReadMore={() => {}}
                    onShowReleaseNotes={() => {}}
                    sources={{}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should disable buttons and display "Removing..." button text when removing app', () => {
        expect(
            renderer.create(
                <AppManagementView
                    apps={List([
                        getImmutableApp({
                            name: 'pc-nrfconnect-foo',
                            displayName: 'Foo app',
                            description: 'Foo description',
                            currentVersion: '1.2.3',
                            latestVersion: '1.2.3',
                            source: 'bar',
                        }),
                    ])}
                    isRetrievingApps={false}
                    removingAppName="bar/pc-nrfconnect-foo"
                    isProcessing
                    onAppSelected={() => {}}
                    onCreateShortcut={() => {}}
                    onInstall={() => {}}
                    onRemove={() => {}}
                    onReadMore={() => {}}
                    onShowReleaseNotes={() => {}}
                    sources={{}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should disable buttons and display "Upgrading..." button text when upgrading app', () => {
        expect(
            renderer.create(
                <AppManagementView
                    apps={List([
                        getImmutableApp({
                            name: 'pc-nrfconnect-foo',
                            displayName: 'Foo app',
                            description: 'Foo description',
                            currentVersion: '1.2.3',
                            latestVersion: '1.2.4',
                            source: 'bar',
                        }),
                    ])}
                    isRetrievingApps={false}
                    upgradingAppName="bar/pc-nrfconnect-foo"
                    isProcessing
                    onAppSelected={() => {}}
                    onCreateShortcut={() => {}}
                    onInstall={() => {}}
                    onRemove={() => {}}
                    onReadMore={() => {}}
                    onShowReleaseNotes={() => {}}
                    sources={{}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should invoke onInstall with app name, source and url when install button is clicked', () => {
        const app = getImmutableApp({
            name: 'pc-nrfconnect-foobar',
            displayName: 'Foobar displayName',
            description: 'Foobar description',
            source: 'beta',
            url: 'https://foo.bar/dists/beta',
        });
        const onInstall = jest.fn();
        const wrapper = mount(
            <AppManagementView
                apps={List([app])}
                isRetrievingApps={false}
                onAppSelected={() => {}}
                onCreateShortcut={() => {}}
                onInstall={onInstall}
                onRemove={() => {}}
                onReadMore={() => {}}
                onShowReleaseNotes={() => {}}
                sources={{}}
            />
        );
        wrapper
            .find('button[title="Install Foobar displayName"]')
            .first()
            .simulate('click');

        expect(onInstall).toHaveBeenCalledWith(app.name, app.source);
    });

    it('should invoke onRemove with app name and source when remove button is clicked', () => {
        const app = getImmutableApp({
            name: 'pc-nrfconnect-foobar',
            displayName: 'Foobar displayName',
            description: 'Foobar description',
            currentVersion: '1.2.3',
            latestVersion: '1.2.3',
            source: 'beta',
        });
        const onRemove = jest.fn();
        const wrapper = mount(
            <AppManagementView
                apps={List([app])}
                isRetrievingApps={false}
                onAppSelected={() => {}}
                onCreateShortcut={() => {}}
                onInstall={() => {}}
                onRemove={onRemove}
                onReadMore={() => {}}
                onShowReleaseNotes={() => {}}
                sources={{}}
            />
        );

        wrapper.find('.dropdown-toggle').first().simulate('click');
        wrapper
            .find('a[title="Remove Foobar displayName"]')
            .first()
            .simulate('click');

        expect(onRemove).toHaveBeenCalledWith(app.name, app.source);
    });

    it('should render more info links for correctly defined homepage', () => {
        expect(
            renderer.create(
                <AppManagementView
                    apps={List([
                        getImmutableApp({
                            name: 'appA',
                            displayName: 'App A',
                            description: 'appA description',
                            homepage: 'https://foo.bar/readme.md',
                        }),
                        getImmutableApp({
                            name: 'appB',
                            displayName: 'App B',
                            description: 'appB description',
                            homepage: '',
                        }),
                        getImmutableApp({
                            name: 'appC',
                            displayName: 'App C',
                            description: 'appC description',
                        }),
                    ])}
                    isRetrievingApps={false}
                    onAppSelected={() => {}}
                    onCreateShortcut={() => {}}
                    onInstall={() => {}}
                    onRemove={() => {}}
                    onReadMore={() => {}}
                    onShowReleaseNotes={() => {}}
                    sources={{}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should invoke onAppSelected with given app item when Open is clicked', () => {
        const app = getImmutableApp({
            name: 'pc-nrfconnect-foobar',
            displayName: 'Foobar displayName',
            description: 'Foobar description',
            currentVersion: '1.2.3',
            path: '/path/to/pc-nrfconnect-foobar',
            isOfficial: false,
        });
        const onAppSelected = jest.fn();
        const wrapper = mount(
            <AppManagementView
                apps={List([app])}
                isRetrievingApps={false}
                onAppSelected={onAppSelected}
                onCreateShortcut={() => {}}
                onInstall={() => {}}
                onRemove={() => {}}
                onReadMore={() => {}}
                onShowReleaseNotes={() => {}}
                sources={{}}
            />
        );
        wrapper
            .find('button[title="Open Foobar displayName"]')
            .first()
            .simulate('click');

        expect(onAppSelected).toHaveBeenCalledWith(app);
    });
});
