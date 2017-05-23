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

import React from 'react';
import { List } from 'immutable';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import AppLaunchView from '../AppLaunchView';
import AppItemButton from '../AppItemButton';
import { getImmutableApp } from '../../models';

describe('AppLaunchView', () => {
    it('should render without any apps', () => {
        expect(renderer.create(
            <AppLaunchView
                apps={List()}
                onAppSelected={() => {}}
                onMount={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render apps sorted by name and isOfficial', () => {
        const templateApp = getImmutableApp({
            currentVersion: '1.2.3',
            engineVersion: '2.x',
            isSupportedEngine: true,
        });
        expect(renderer.create(
            <AppLaunchView
                apps={
                    List([
                        templateApp
                            .set('name', 'appB')
                            .set('isOfficial', false)
                            .set('path', '/path/to/local/B'),
                        templateApp
                            .set('name', 'appB')
                            .set('isOfficial', true)
                            .set('path', '/path/to/B'),
                        templateApp
                            .set('name', 'appA')
                            .set('isOfficial', false)
                            .set('path', '/path/to/local/A'),
                        templateApp
                            .set('name', 'appA')
                            .set('isOfficial', true)
                            .set('path', '/path/to/A'),
                        templateApp
                            .set('name', 'appA')
                            .set('isOfficial', true)
                            .set('path', '/path/to/otherA'),
                    ])
                }
                onAppSelected={() => {}}
                onMount={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render app with no engine version', () => {
        const app = getImmutableApp({
            name: 'pc-nrfconnect-foobar',
            currentVersion: '1.2.3',
            path: '/path/to/pc-nrfconnect-foobar',
            isOfficial: false,
        });
        expect(renderer.create(
            <AppLaunchView
                apps={List([app])}
                onMount={() => {}}
                onAppSelected={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render app with unsupported engine version', () => {
        const app = getImmutableApp({
            name: 'pc-nrfconnect-foobar',
            currentVersion: '1.2.3',
            path: '/path/to/pc-nrfconnect-foobar',
            isOfficial: false,
            engineVersion: '1.x',
            isSupportedEngine: false,
        });
        expect(renderer.create(
            <AppLaunchView
                apps={List([app])}
                onMount={() => {}}
                onAppSelected={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should invoke onAppSelected with given app item when app is clicked', () => {
        const app = getImmutableApp({
            name: 'pc-nrfconnect-foobar',
            currentVersion: '1.2.3',
            path: '/path/to/pc-nrfconnect-foobar',
            isOfficial: false,
        });
        const onAppSelected = jest.fn();
        const wrapper = mount(
            <AppLaunchView
                apps={List([app])}
                onAppSelected={onAppSelected}
                onMount={() => {}}
            />,
        );
        wrapper.find(AppItemButton).first().simulate('click');

        expect(onAppSelected).toHaveBeenCalledWith(app);
    });
});
