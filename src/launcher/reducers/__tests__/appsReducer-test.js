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

jest.mock('electron', () => ({
    remote: { require: () => {} },
}));

import * as AppsActions from '../../actions/appsActions';
import reducer from '../appsReducer';

const initialState = reducer(undefined, {});

const app1 = {
    name: 'pc-nrfconnect-foo',
    displayName: 'Foo app',
    currentVersion: '1.2.3',
    description: 'Foo description',
    path: '/path/to/app',
    iconPath: './path/to/icon.png',
    engineVersion: null,
    homepage: null,
    isOfficial: null,
    latestVersion: null,
    sharedVersion: null,
    shortcutIconPath: null,
    source: null,
    upgradeAvailable: null,
    url: null,
    releaseNote: null,
    repositoryUrl: null,
};
const app2 = {
    name: 'pc-nrfconnect-bar',
    displayName: 'Bar app',
    currentVersion: '1.2.4',
    description: null,
    path: null,
    iconPath: null,
    engineVersion: null,
    homepage: null,
    isOfficial: null,
    latestVersion: null,
    sharedVersion: null,
    shortcutIconPath: null,
    source: null,
    upgradeAvailable: null,
    url: null,
    releaseNote: null,
    repositoryUrl: null,
};

describe('appsReducer', () => {
    it('should have no apps in initial state', () => {
        expect(initialState.localApps.size).toEqual(0);
        expect(initialState.officialApps.size).toEqual(0);
    });

    it('should be loading apps in initial state', () => {
        expect(initialState.isLoadingLocalApps).toEqual(true);
        expect(initialState.isLoadingOfficialApps).toEqual(true);
    });

    it('should be loading local apps after LOAD_LOCAL_APPS has been dispatched', () => {
        const state = reducer(initialState, {
            type: AppsActions.LOAD_LOCAL_APPS,
        });
        expect(state.isLoadingLocalApps).toEqual(true);
    });

    it('should have local apps when LOAD_LOCAL_APPS_SUCCESS has been dispatched with apps', () => {
        const state = reducer(initialState, {
            type: AppsActions.LOAD_LOCAL_APPS_SUCCESS,
            apps: [app1, app2],
        });
        expect(state.localApps.get(0).toJS()).toEqual(app1);
        expect(state.localApps.get(1).toJS()).toEqual(app2);
    });

    it('should not be loading local apps after LOAD_LOCAL_APPS_SUCCESS has been dispatched', () => {
        const stateBefore = initialState.set('isLoadingLocalApps', true);
        const stateAfter = reducer(stateBefore, {
            type: AppsActions.LOAD_LOCAL_APPS_SUCCESS,
            apps: [],
        });
        expect(stateAfter.isLoadingLocalApps).toEqual(false);
    });

    it('should not be loading local apps after LOAD_LOCAL_APPS_ERROR has been dispatched', () => {
        const stateBefore = initialState.set('isLoadingLocalApps', true);
        const stateAfter = reducer(stateBefore, {
            type: AppsActions.LOAD_LOCAL_APPS_ERROR,
        });
        expect(stateAfter.isLoadingLocalApps).toEqual(false);
    });

    it('should be loading official apps after LOAD_OFFICIAL_APPS has been dispatched', () => {
        const state = reducer(initialState, {
            type: AppsActions.LOAD_OFFICIAL_APPS,
        });
        expect(state.isLoadingOfficialApps).toEqual(true);
    });

    it('should have official apps when LOAD_OFFICIAL_APPS_SUCCESS has been dispatched with apps', () => {
        const state = reducer(initialState, {
            type: AppsActions.LOAD_OFFICIAL_APPS_SUCCESS,
            apps: [app1, app2],
        });
        expect(state.officialApps.get(0).toJS()).toEqual(app1);
        expect(state.officialApps.get(1).toJS()).toEqual(app2);
    });

    it('should not be loading official apps after LOAD_OFFICIAL_APPS_SUCCESS has been dispatched', () => {
        const stateBefore = initialState.set('isLoadingOfficialApps', true);
        const stateAfter = reducer(stateBefore, {
            type: AppsActions.LOAD_OFFICIAL_APPS_SUCCESS,
            apps: [],
        });
        expect(stateAfter.isLoadingOfficialApps).toEqual(false);
    });

    it('should not be loading official apps after LOAD_OFFICIAL_APPS_ERROR has been dispatched', () => {
        const stateBefore = initialState.set('isLoadingOfficialApps', true);
        const stateAfter = reducer(stateBefore, {
            type: AppsActions.LOAD_OFFICIAL_APPS_ERROR,
        });
        expect(stateAfter.isLoadingOfficialApps).toEqual(false);
    });

    it('should be installing app after INSTALL_OFFICIAL_APP has been dispatched', () => {
        const state = reducer(initialState, {
            type: AppsActions.INSTALL_OFFICIAL_APP,
            name: 'pc-nrfconnect-foo',
            source: 'bar',
        });
        expect(state.installingAppName).toEqual('bar/pc-nrfconnect-foo');
    });

    it('should not be installing app after INSTALL_OFFICIAL_APP_SUCCESS has been dispatched', () => {
        const stateBefore = initialState.set(
            'installingAppName',
            'pc-nrfconnect-foo'
        );
        const stateAfter = reducer(stateBefore, {
            type: AppsActions.INSTALL_OFFICIAL_APP_SUCCESS,
            name: 'pc-nrfconnect-foo',
        });
        expect(stateAfter.installingAppName).toEqual(
            initialState.installingAppName
        );
    });

    it('should not be installing app after INSTALL_OFFICIAL_APP_ERROR has been dispatched', () => {
        const stateBefore = initialState.set(
            'installingAppName',
            'pc-nrfconnect-foo'
        );
        const stateAfter = reducer(stateBefore, {
            type: AppsActions.INSTALL_OFFICIAL_APP_ERROR,
        });
        expect(stateAfter.installingAppName).toEqual(
            initialState.installingAppName
        );
    });

    it('should be removing app after REMOVE_OFFICIAL_APP has been dispatched', () => {
        const state = reducer(initialState, {
            type: AppsActions.REMOVE_OFFICIAL_APP,
            name: 'pc-nrfconnect-foo',
            source: 'bar',
        });
        expect(state.removingAppName).toEqual('bar/pc-nrfconnect-foo');
    });

    it('should not be removing app after REMOVE_OFFICIAL_APP_SUCCESS has been dispatched', () => {
        const stateBefore = initialState.set(
            'removingAppName',
            'pc-nrfconnect-foo'
        );
        const stateAfter = reducer(stateBefore, {
            type: AppsActions.REMOVE_OFFICIAL_APP_SUCCESS,
            name: 'pc-nrfconnect-foo',
        });
        expect(stateAfter.removingAppName).toEqual(
            initialState.removingAppName
        );
    });

    it('should not be removing app after REMOVE_OFFICIAL_APP_ERROR has been dispatched', () => {
        const stateBefore = initialState.set(
            'removingAppName',
            'pc-nrfconnect-foo'
        );
        const stateAfter = reducer(stateBefore, {
            type: AppsActions.REMOVE_OFFICIAL_APP_ERROR,
        });
        expect(stateAfter.removingAppName).toEqual(
            initialState.removingAppName
        );
    });

    it('should be upgrading app after UPGRADE_OFFICIAL_APP has been dispatched', () => {
        const state = reducer(initialState, {
            type: AppsActions.UPGRADE_OFFICIAL_APP,
            name: 'pc-nrfconnect-foo',
            source: 'bar',
        });
        expect(state.upgradingAppName).toEqual('bar/pc-nrfconnect-foo');
    });

    it('should not be upgrading app after UPGRADE_OFFICIAL_APP_SUCCESS has been dispatched', () => {
        const stateBefore = initialState.set(
            'upgradingAppName',
            'pc-nrfconnect-foo'
        );
        const stateAfter = reducer(stateBefore, {
            type: AppsActions.UPGRADE_OFFICIAL_APP_SUCCESS,
            name: 'pc-nrfconnect-foo',
        });
        expect(stateAfter.upgradingAppName).toEqual(
            initialState.upgradingAppName
        );
    });

    it('should not be removing app after UPGRADE_OFFICIAL_APP_ERROR has been dispatched', () => {
        const stateBefore = initialState.set(
            'upgradingAppName',
            'pc-nrfconnect-foo'
        );
        const stateAfter = reducer(stateBefore, {
            type: AppsActions.UPGRADE_OFFICIAL_APP_ERROR,
        });
        expect(stateAfter.upgradingAppName).toEqual(
            initialState.upgradingAppName
        );
    });

    it('should show confirm dialog when SHOW_CONFIRM_LAUNCH_DIALOG has been dispatched', () => {
        const state = reducer(initialState, {
            type: AppsActions.SHOW_CONFIRM_LAUNCH_DIALOG,
            app: app1,
        });
        expect(state.isConfirmLaunchDialogVisible).toEqual(true);
    });

    it('should add text to state when SHOW_CONFIRM_LAUNCH_DIALOG has been dispatched with text', () => {
        const state = reducer(initialState, {
            type: AppsActions.SHOW_CONFIRM_LAUNCH_DIALOG,
            text: 'Do you confirm?',
        });
        expect(state.confirmLaunchText).toEqual('Do you confirm?');
    });

    it('should add app to state when SHOW_CONFIRM_LAUNCH_DIALOG has been dispatched with app', () => {
        const state = reducer(initialState, {
            type: AppsActions.SHOW_CONFIRM_LAUNCH_DIALOG,
            app: app1,
        });
        expect(state.confirmLaunchApp).toEqual(app1);
    });

    it('should hide confirm dialog when HIDE_CONFIRM_LAUNCH_DIALOG has been dispatched', () => {
        const stateBefore = initialState.set(
            'isConfirmLaunchDialogVisible',
            true
        );
        const stateAfter = reducer(stateBefore, {
            type: AppsActions.HIDE_CONFIRM_LAUNCH_DIALOG,
        });
        expect(stateAfter.isConfirmLaunchDialogVisible).toEqual(false);
    });

    it('should be downloading latest app info when DOWNLOAD_LATEST_APP_INFO has been dispatched', () => {
        const state = reducer(initialState, {
            type: AppsActions.DOWNLOAD_LATEST_APP_INFO,
        });
        expect(state.isDownloadingLatestAppInfo).toEqual(true);
    });

    it('should have downloaded latest app info when DOWNLOAD_LATEST_APP_INFO_SUCCESS has been dispatched', () => {
        const state = reducer(initialState, {
            type: AppsActions.DOWNLOAD_LATEST_APP_INFO_SUCCESS,
        });
        expect(state.isLatestAppInfoDownloaded).toEqual(true);
    });

    it('should not be downloading latest app info when DOWNLOAD_LATEST_APP_INFO_SUCCESS has been dispatched', () => {
        const state = reducer(
            initialState.set('isDownloadingLatestAppInfo', true),
            {
                type: AppsActions.DOWNLOAD_LATEST_APP_INFO_SUCCESS,
            }
        );
        expect(state.isDownloadingLatestAppInfo).toEqual(false);
    });

    it('should not be downloading latest app info when DOWNLOAD_LATEST_APP_INFO_ERROR has been dispatched', () => {
        const state = reducer(
            initialState.set('isDownloadingLatestAppInfo', true),
            {
                type: AppsActions.DOWNLOAD_LATEST_APP_INFO_ERROR,
            }
        );
        expect(state.isDownloadingLatestAppInfo).toEqual(false);
    });

    it('should set a last update check date when DOWNLOAD_LATEST_APP_INFO_SUCCESS has been dispatched', () => {
        const state = reducer(initialState, {
            type: AppsActions.DOWNLOAD_LATEST_APP_INFO_SUCCESS,
        });
        expect(state.lastUpdateCheckDate).not.toBeNull();
    });
});
