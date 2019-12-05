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
import { cleanup, fireEvent } from '@testing-library/react';
import render from '../../../test/testrenderer';

import ConfirmationDialog from './ConfirmationDialog';

const noop = () => {};
const defaultProps = {
    isVisible: true,
    onCancel: noop,
    onOk: noop,
};

describe('ConfirmationDialog', () => {
    describe('visibility', () => {
        it('is rendered when visible', () => {
            const { queryByRole } = render(
                <ConfirmationDialog {...defaultProps} isVisible />,
            );
            expect(queryByRole('dialog')).toBeInTheDocument();
        });

        it('is not rendered when invisible', () => {
            const { queryByRole } = render(
                <ConfirmationDialog {...defaultProps} isVisible={false} />,
            );
            expect(queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    describe('shows the expected content', () => {
        it('in the title', () => {
            const title = 'a title';
            const { getByTestId } = render(<ConfirmationDialog {...defaultProps} title={title} />);

            expect(getByTestId('title').textContent).toBe(title);
        });

        it('with children', () => {
            const children = ['some', 'children'];
            const { getByText } = render(
                <ConfirmationDialog {...defaultProps}>
                    {children}
                </ConfirmationDialog>,
            );

            // react-bootstrap/Modal does not allow setting a data-testid on Modal.Body,
            // so we have to search through the whole doc, but that should not be a problem here.
            expect(getByText(/some/)).toBeInTheDocument();
            expect(getByText(/children/)).toBeInTheDocument();
        });

        it('with text', () => {
            const text = 'a text';
            const { getByTestId } = render(<ConfirmationDialog {...defaultProps} text={text} />);

            expect(getByTestId('body').textContent).toBe(text);
        });
    });

    describe('can be confirmed through the Ok button', () => {
        it('invokes the expected action', () => {
            const onOkMock = jest.fn();
            const { getByText } = render(<ConfirmationDialog {...defaultProps} onOk={onOkMock} />);

            const okButton = getByText('OK');
            fireEvent.click(okButton);

            expect(onOkMock).toHaveBeenCalled();
        });
        it('can be disabled', () => {
            const isDisabledFor = props => {
                const { getByText } = render(<ConfirmationDialog {...defaultProps} {...props} />);
                expect(getByText('OK')).toBeDisabled();
                cleanup();
            };

            isDisabledFor({ isInProgress: true });
            isDisabledFor({ isInProgress: true, isOkButtonEnabled: false });
            isDisabledFor({ isOkButtonEnabled: false });
        });
    });

    describe('has cancelling', () => {
        describe('through all close buttons', () => {
            it('the close button in the header', () => {
                const onCancelMock = jest.fn();
                const { getByText } = render(
                    <ConfirmationDialog {...defaultProps} onCancel={onCancelMock} />,
                );

                const closeButton = getByText('Close');
                fireEvent.click(closeButton);

                expect(onCancelMock).toHaveBeenCalled();
            });

            it('the cancel button', () => {
                const onCancelMock = jest.fn();
                const { getByText } = render(
                    <ConfirmationDialog {...defaultProps} onCancel={onCancelMock} />,
                );

                const cancelButton = getByText('Cancel');
                fireEvent.click(cancelButton);

                expect(onCancelMock).toHaveBeenCalled();
            });
        });

        it('is disabled when in progess', async () => {
            const onCancelMock = jest.fn();
            const { rerender, queryByText, getByText } = render(
                <ConfirmationDialog {...defaultProps} onCancel={onCancelMock} />,
            );
            rerender(
                <ConfirmationDialog {...defaultProps} onCancel={onCancelMock} isInProgress />,
            );

            expect(queryByText('Close')).not.toBeInTheDocument();
            expect(getByText('Cancel')).toBeDisabled();
        });
    });
});
