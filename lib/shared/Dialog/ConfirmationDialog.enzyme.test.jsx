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
import { shallow } from 'enzyme';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import ConfirmationDialog from './ConfirmationDialog';
import Spinner from './Spinner';

const noop = () => {};

const dialog = props => {
    const defaultProps = {
        isVisible: true,
        onCancel: noop,
        onOk: noop,
    };
    return shallow(<ConfirmationDialog {...defaultProps} {...props} />);
};

const getOkButton = modal => modal.find(Button).at(0);
const getCancelButton = modal => modal.find(Button).at(1);

describe('ConfirmationDialog', () => {
    it('passes visibility to the show prop', () => {
        expect(dialog({ isVisible: true }).props()).toHaveProperty('show', true);
        expect(dialog({ isVisible: false }).props()).toHaveProperty('show', false);
    });

    it('passes onCancel on', () => {
        const onCancel = () => {};

        expect(dialog({ onCancel }).props()).toHaveProperty('onHide', onCancel);
        expect(getCancelButton(dialog({ onCancel })).props()).toHaveProperty('onClick', onCancel);
    });

    describe('while in progress', () => {
        const inProgress = dialog({ isInProgress: true });
        const notInProgress = dialog({ isInProgress: false });

        it('the ok button is disabled', () => {
            expect(getOkButton(inProgress).props()).toHaveProperty('disabled', true);
            expect(getOkButton(notInProgress).props()).toHaveProperty('disabled', false);
        });

        it('the backdrop gets static', () => {
            expect(inProgress.props()).toHaveProperty('backdrop', 'static');
            expect(notInProgress.props()).toHaveProperty('backdrop', false);
        });

        it('the close button in the header is removed', () => {
            const getHeader = modal => modal.find(Modal.Header).first();

            expect(getHeader(inProgress).props()).toHaveProperty('closeButton', false);
            expect(getHeader(notInProgress).props()).toHaveProperty('closeButton', true);
        });

        it('the cancel button is disabled', () => {
            expect(getCancelButton(inProgress).props()).toHaveProperty('disabled', true);
            expect(getCancelButton(notInProgress).props()).toHaveProperty('disabled', false);
        });

        it('shows a spinner', () => {
            expect(inProgress.exists(Spinner)).toBe(true);
            expect(notInProgress.exists(Spinner)).toBe(false);
        });
    });

    it('displays the title', () => {
        const titleText = 'a title';
        const title = dialog({ title: titleText }).find(Modal.Title).first();

        expect(title.text()).toEqual(titleText);
    });

    describe('the body', () => {
        it('usually contains the children', () => {
            const children = ['some', 'children'];
            const text = 'a text';
            const body = dialog({ children, text }).find(Modal.Body).first();

            expect(body.contains(children)).toBe(true);
        });

        it('falls back to the text', () => {
            const text = 'a text';
            const body = dialog({ text }).find(Modal.Body).first();

            expect(body.contains(<p data-testid="body">{text}</p>)).toBe(true);
        });
    });

    describe('the ok button', () => {
        const onOk = () => {};
        const okButtonText = 'a button text';

        it('passes on onOk', () => {
            expect(getOkButton(dialog({ onOk })).props()).toHaveProperty('onClick', onOk);
        });

        it('passes on okButtonText', () => {
            expect(getOkButton(dialog({ okButtonText })).text())
                .toEqual(okButtonText);
        });

        it('passes on isOkButtonEnabled', () => {
            const okEnabled = dialog({ isOkButtonEnabled: true });
            const okDisabled = dialog({ isOkButtonEnabled: false });

            expect(getOkButton(okEnabled).props()).toHaveProperty('disabled', false);
            expect(getOkButton(okDisabled).props()).toHaveProperty('disabled', true);
        });
    });

    it('the cancel button passes on cancelButtonText', () => {
        const cancelButtonText = 'another button text';
        expect(getCancelButton(dialog({ cancelButtonText })).text()).toEqual(cancelButtonText);
    });
});
