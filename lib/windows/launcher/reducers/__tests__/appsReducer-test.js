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
};
const app2 = {
    name: 'pc-nrfconnect-bar',
    displayName: 'Bar app',
    currentVersion: '1.2.4',
};

describe('appsReducer', () => {
    it('should have no apps in initial state', () => {
        expect(initialState.localApps.size).toEqual(0);
        expect(initialState.officialApps.size).toEqual(0);
    });

    it('should not be loading apps in initial state', () => {
        expect(initialState.isLoadingLocalApps).toEqual(false);
        expect(initialState.isLoadingOfficialApps).toEqual(false);
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
        });
        expect(state.installingAppName).toEqual('pc-nrfconnect-foo');
    });

    it('should not be installing app after INSTALL_OFFICIAL_APP_SUCCESS has been dispatched', () => {
        const stateBefore = initialState.set('installingAppName', 'pc-nrfconnect-foo');
        const stateAfter = reducer(stateBefore, {
            type: AppsActions.INSTALL_OFFICIAL_APP_SUCCESS,
            name: 'pc-nrfconnect-foo',
        });
        expect(stateAfter.installingAppName).toEqual(initialState.installingAppName);
    });

    it('should not be installing app after INSTALL_OFFICIAL_APP_ERROR has been dispatched', () => {
        const stateBefore = initialState.set('installingAppName', 'pc-nrfconnect-foo');
        const stateAfter = reducer(stateBefore, {
            type: AppsActions.INSTALL_OFFICIAL_APP_ERROR,
        });
        expect(stateAfter.installingAppName).toEqual(initialState.installingAppName);
    });

    it('should be removing app after REMOVE_OFFICIAL_APP has been dispatched', () => {
        const state = reducer(initialState, {
            type: AppsActions.REMOVE_OFFICIAL_APP,
            name: 'pc-nrfconnect-foo',
        });
        expect(state.removingAppName).toEqual('pc-nrfconnect-foo');
    });

    it('should not be removing app after REMOVE_OFFICIAL_APP_SUCCESS has been dispatched', () => {
        const stateBefore = initialState.set('removingAppName', 'pc-nrfconnect-foo');
        const stateAfter = reducer(stateBefore, {
            type: AppsActions.REMOVE_OFFICIAL_APP_SUCCESS,
            name: 'pc-nrfconnect-foo',
        });
        expect(stateAfter.removingAppName).toEqual(initialState.removingAppName);
    });

    it('should not be removing app after REMOVE_OFFICIAL_APP_ERROR has been dispatched', () => {
        const stateBefore = initialState.set('removingAppName', 'pc-nrfconnect-foo');
        const stateAfter = reducer(stateBefore, {
            type: AppsActions.REMOVE_OFFICIAL_APP_ERROR,
        });
        expect(stateAfter.removingAppName).toEqual(initialState.removingAppName);
    });

    it('should be upgrading app after UPGRADE_OFFICIAL_APP has been dispatched', () => {
        const state = reducer(initialState, {
            type: AppsActions.UPGRADE_OFFICIAL_APP,
            name: 'pc-nrfconnect-foo',
        });
        expect(state.upgradingAppName).toEqual('pc-nrfconnect-foo');
    });

    it('should not be upgrading app after UPGRADE_OFFICIAL_APP_SUCCESS has been dispatched', () => {
        const stateBefore = initialState.set('upgradingAppName', 'pc-nrfconnect-foo');
        const stateAfter = reducer(stateBefore, {
            type: AppsActions.UPGRADE_OFFICIAL_APP_SUCCESS,
            name: 'pc-nrfconnect-foo',
        });
        expect(stateAfter.upgradingAppName).toEqual(initialState.upgradingAppName);
    });

    it('should not be removing app after UPGRADE_OFFICIAL_APP_ERROR has been dispatched', () => {
        const stateBefore = initialState.set('upgradingAppName', 'pc-nrfconnect-foo');
        const stateAfter = reducer(stateBefore, {
            type: AppsActions.UPGRADE_OFFICIAL_APP_ERROR,
        });
        expect(stateAfter.upgradingAppName).toEqual(initialState.upgradingAppName);
    });
});
