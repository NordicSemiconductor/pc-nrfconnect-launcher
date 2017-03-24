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

describe('appReducer', () => {
    it('should have no apps in initial state', () => {
        expect(initialState.installedApps.size).toEqual(0);
        expect(initialState.availableApps.size).toEqual(0);
    });

    it('should not be retrieving app lists in initial state', () => {
        expect(initialState.isRetrievingInstalledApps).toEqual(false);
        expect(initialState.isRetrievingAvailableApps).toEqual(false);
    });

    it('should be retrieving installed local apps after RETRIEVE_INSTALLED_APPS has been dispatched', () => {
        const state = reducer(initialState, {
            type: AppsActions.RETRIEVE_INSTALLED_APPS,
        });

        expect(state.isRetrievingInstalledApps).toEqual(true);
    });

    it('should have installed local apps when RETRIEVE_INSTALLED_APPS_SUCCESS has been dispatched with apps', () => {
        const app1 = {
            name: 'pc-nrfconnect-foo',
            displayName: 'Foo app',
            version: '1.2.3',
            description: 'Foo description',
            path: '/path/to/app',
            iconPath: './path/to/icon.png',
        };
        const app2 = {
            name: 'pc-nrfconnect-bar',
            displayName: 'Bar app',
            version: '1.2.4',
        };
        const state = reducer(initialState, {
            type: AppsActions.RETRIEVE_INSTALLED_APPS_SUCCESS,
            apps: [app1, app2],
        });

        expect(state.installedApps.get(0).toJS()).toEqual(app1);
        expect(state.installedApps.get(1).toJS()).toEqual(app2);
    });

    it('should not be loading local apps after RETRIEVE_INSTALLED_APPS_SUCCESS has been dispatched', () => {
        const stateBefore = initialState.set('isRetrievingInstalledApps', true);
        const stateAfter = reducer(stateBefore, {
            type: AppsActions.RETRIEVE_INSTALLED_APPS_SUCCESS,
            apps: [],
        });

        expect(stateAfter.isRetrievingInstalledApps).toEqual(false);
    });

    it('should not be retrieving local apps after RETRIEVE_INSTALLED_APPS_ERROR has been dispatched', () => {
        const stateBefore = initialState.set('isRetrievingInstalledApps', true);
        const stateAfter = reducer(stateBefore, {
            type: AppsActions.RETRIEVE_INSTALLED_APPS_ERROR,
        });

        expect(stateAfter.isRetrievingInstalledApps).toEqual(false);
    });
});
