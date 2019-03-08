/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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

import React from 'react';
import { List } from 'immutable';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import AppManagementView from '../AppManagementView';
import getImmutableApp from '../../models';

describe('AppManagementView', () => {
    it('should render spinner when retrieving apps', () => {
        expect(renderer.create(
            <AppManagementView
                apps={List()}
                isRetrievingApps
                isLatestAppInfoDownloaded
                onInstall={() => {}}
                onRemove={() => {}}
                onUpgrade={() => {}}
                onReadMore={() => {}}
                onMount={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render without any apps', () => {
        expect(renderer.create(
            <AppManagementView
                apps={List()}
                isRetrievingApps={false}
                isLatestAppInfoDownloaded
                onInstall={() => {}}
                onRemove={() => {}}
                onUpgrade={() => {}}
                onReadMore={() => {}}
                onMount={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render not-installed, installed, and upgradable apps sorted by name', () => {
        expect(renderer.create(
            <AppManagementView
                apps={
                    List([
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
                    ])
                }
                isRetrievingApps={false}
                isLatestAppInfoDownloaded
                onInstall={() => {}}
                onRemove={() => {}}
                onUpgrade={() => {}}
                onReadMore={() => {}}
                onMount={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should disable buttons and display "Installing..." button text when installing app', () => {
        expect(renderer.create(
            <AppManagementView
                apps={List([
                    getImmutableApp({
                        name: 'pc-nrfconnect-foo',
                        displayName: 'Foo app',
                        description: 'Foo description',
                    }),
                ])}
                isRetrievingApps={false}
                isLatestAppInfoDownloaded
                installingAppName="pc-nrfconnect-foo"
                onInstall={() => {}}
                onRemove={() => {}}
                onUpgrade={() => {}}
                onReadMore={() => {}}
                onMount={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should disable buttons and display "Removing..." button text when removing app', () => {
        expect(renderer.create(
            <AppManagementView
                apps={List([
                    getImmutableApp({
                        name: 'pc-nrfconnect-foo',
                        displayName: 'Foo app',
                        description: 'Foo description',
                        currentVersion: '1.2.3',
                        latestVersion: '1.2.3',
                    }),
                ])}
                isRetrievingApps={false}
                isLatestAppInfoDownloaded
                removingAppName="pc-nrfconnect-foo"
                onInstall={() => {}}
                onRemove={() => {}}
                onUpgrade={() => {}}
                onReadMore={() => {}}
                onMount={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should disable buttons and display "Upgrading..." button text when upgrading app', () => {
        expect(renderer.create(
            <AppManagementView
                apps={List([
                    getImmutableApp({
                        name: 'pc-nrfconnect-foo',
                        displayName: 'Foo app',
                        description: 'Foo description',
                        currentVersion: '1.2.3',
                        latestVersion: '1.2.4',
                    }),
                ])}
                isRetrievingApps={false}
                isLatestAppInfoDownloaded
                upgradingAppName="pc-nrfconnect-foo"
                onInstall={() => {}}
                onRemove={() => {}}
                onUpgrade={() => {}}
                onReadMore={() => {}}
                onMount={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should invoke onInstall with app name, source and url when install button is clicked', () => {
        const app = getImmutableApp({
            name: 'pc-nrfconnect-foobar',
            description: 'Foobar description',
            source: 'beta',
            url: 'https://foo.bar/dists/beta',
        });
        const onInstall = jest.fn();
        const wrapper = mount(
            <AppManagementView
                apps={List([app])}
                isRetrievingApps={false}
                isLatestAppInfoDownloaded
                onInstall={onInstall}
                onRemove={() => {}}
                onUpgrade={() => {}}
                onReadMore={() => {}}
                onMount={() => {}}
            />,
        );
        wrapper.find('button[title="Install pc-nrfconnect-foobar"]').first().simulate('click');

        expect(onInstall).toHaveBeenCalledWith(app.name, app.source);
    });

    it('should invoke onRemove with app name and source when remove button is clicked', () => {
        const app = getImmutableApp({
            name: 'pc-nrfconnect-foobar',
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
                isLatestAppInfoDownloaded
                onInstall={() => {}}
                onRemove={onRemove}
                onUpgrade={() => {}}
                onReadMore={() => {}}
                onMount={() => {}}
            />,
        );
        wrapper.find('button[title="Remove pc-nrfconnect-foobar"]').first().simulate('click');

        expect(onRemove).toHaveBeenCalledWith(app.name, app.source);
    });

    it('should invoke onUpgrade with app name and latest version when upgrade button is clicked', () => {
        const app = getImmutableApp({
            name: 'pc-nrfconnect-foobar',
            description: 'Foobar description',
            currentVersion: '1.2.3',
            latestVersion: '1.2.4',
            source: 'beta',
            url: 'https://foo.bar/dists/beta',
        });
        const onUpgrade = jest.fn();
        const wrapper = mount(
            <AppManagementView
                apps={List([app])}
                isRetrievingApps={false}
                isLatestAppInfoDownloaded
                onInstall={() => {}}
                onRemove={() => {}}
                onUpgrade={onUpgrade}
                onReadMore={() => {}}
                onMount={() => {}}
            />,
        );
        wrapper.find('button[title="Upgrade pc-nrfconnect-foobar from v1.2.3 to v1.2.4"]').first().simulate('click');

        expect(onUpgrade).toHaveBeenCalledWith(app.name, app.latestVersion, app.source);
    });

    it('should invoke onDownloadLatestAppInfo when mounted and latest app info is not downloaded', () => {
        const onDownloadLatestAppInfo = jest.fn();
        mount(
            <AppManagementView
                apps={List([])}
                isRetrievingApps={false}
                isLatestAppInfoDownloaded={false}
                onDownloadLatestAppInfo={onDownloadLatestAppInfo}
                onInstall={() => {}}
                onRemove={() => {}}
                onUpgrade={() => {}}
                onReadMore={() => {}}
                onMount={() => {}}
            />,
        );

        expect(onDownloadLatestAppInfo).toHaveBeenCalled();
    });

    it('should not invoke onDownloadLatestAppInfo when mounted and latest app info has been downloaded', () => {
        const onDownloadLatestAppInfo = jest.fn();
        mount(
            <AppManagementView
                apps={List([])}
                isRetrievingApps={false}
                isLatestAppInfoDownloaded
                onDownloadLatestAppInfo={onDownloadLatestAppInfo}
                onInstall={() => {}}
                onRemove={() => {}}
                onUpgrade={() => {}}
                onReadMore={() => {}}
                onMount={() => {}}
            />,
        );

        expect(onDownloadLatestAppInfo).not.toHaveBeenCalled();
    });
});
