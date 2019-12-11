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
import { fireEvent } from '@testing-library/react';

import render from '../../../../test/testrenderer';
import NavMenu from './NavMenu';

const aMenuItem = { text: 'an item', iconClass: 'an icon class' };
const anotherMenuItem = { text: 'another item', iconClass: 'another icon class' };
const menuItems = [aMenuItem, anotherMenuItem];

describe('NavMenu', () => {
    it('can be empty', () => {
        const { getByTestId, queryByText } = render(<NavMenu items={[]} />);

        expect(getByTestId('nav-menu')).toBeEmpty();
        expect(queryByText('an item')).not.toBeInTheDocument();
    });

    it('displays multiple items', () => {
        const { getByText } = render(<NavMenu items={menuItems} />);

        expect(getByText('an item')).toBeInTheDocument();
        expect(getByText('another item')).toBeInTheDocument();
    });

    it('an item is displayed correctly', () => {
        const { getByText, getByTestId } = render(<NavMenu items={menuItems} />);
        const icon = getByTestId('an icon class');
        const button = getByText('an item').parentNode;

        expect(button).toContainElement(icon);
        expect(button).toHaveAttribute('title', 'an item (Alt+1)');
        expect(button).toHaveTextContent('an item');
    });

    it('a selected item is highligthed', async () => {
        const { getByText } = render(<NavMenu items={menuItems} />);
        const button = getByText('another item').parentNode;

        expect(button).not.toHaveClass('active');

        fireEvent.click(button);

        expect(button).toHaveClass('active');
    });

    it('a item can be selected by hotkey', async () => {
        const { getByText } = render(<NavMenu items={menuItems} />);
        const button = getByText('an item').parentNode;

        expect(button).not.toHaveClass('active');

        const charCodeOfOne = '1'.charCodeAt(0); // mousetrap.js needs 'which' to be set
        const altOne = { code: 'Digit1', which: charCodeOfOne, altKey: true };
        fireEvent.keyDown(document.body, altOne);

        expect(button).toHaveClass('active');
    });
});
