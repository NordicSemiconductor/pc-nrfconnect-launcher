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
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import LaunchableAppItem from '../LaunchableAppItem';
import AppItemButton from '../AppItemButton';
import { getImmutableApp } from '../../models';

const app = getImmutableApp({
    name: 'pc-nrfconnect-foobar',
    currentVersion: '1.2.3',
    path: '/path/to/pc-nrfconnect-foobar',
    isOfficial: true,
});

describe('LaunchableAppItem', () => {
    it('should render with required props', () => {
        expect(renderer.create(
            <LaunchableAppItem
                app={app}
                onClick={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render with displayName instead of name if provided', () => {
        expect(renderer.create(
            <LaunchableAppItem
                app={app.set('displayName', 'Foobar Tool')}
                onClick={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render custom icon if provided', () => {
        expect(renderer.create(
            <LaunchableAppItem
                app={app.set('iconPath', './path/to/icon.png')}
                onClick={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render official if isOfficial is true', () => {
        expect(renderer.create(
            <LaunchableAppItem
                app={app.set('isOfficial', true)}
                onClick={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should invoke onClick when launch button has been clicked', () => {
        const onClick = jest.fn();
        const wrapper = mount(
            <LaunchableAppItem
                app={app}
                onClick={onClick}
            />,
        );
        wrapper.find(AppItemButton).first().simulate('click');

        expect(onClick).toHaveBeenCalled();
    });
});
