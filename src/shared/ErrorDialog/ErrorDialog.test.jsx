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
import { fireEvent, waitForElementToBeRemoved } from '@testing-library/react';

import render from '../../../test/testrenderer';
import ErrorDialog from './ErrorDialog';
import { showDialog } from './errorDialogActions';

describe('ErrorDialog', () => {
    it('is not rendered when there is no error', () => {
        const { queryByRole } = render(<ErrorDialog />);
        expect(queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render visible dialog with one message', () => {
        const { getByRole, queryByText } = render(
            <ErrorDialog />,
            [showDialog('An error occured')],
        );

        expect(getByRole('dialog')).toBeInTheDocument();
        expect(queryByText('An error occured')).toBeInTheDocument();
    });

    it('should render visible dialog with two messages', () => {
        const { getByRole, queryByText } = render(
            <ErrorDialog />,
            [showDialog('An error occured'), showDialog('Another error occured')],
        );

        expect(getByRole('dialog')).toBeInTheDocument();
        expect(queryByText('An error occured')).toBeInTheDocument();
        expect(queryByText('Another error occured')).toBeInTheDocument();
    });

    describe('has 2 close buttons', () => {
        it('with the text "Close"', () => {
            const { getAllByRole } = render(
                <ErrorDialog />,
                [showDialog('An error occured')],
            );

            const buttons = getAllByRole('button');
            expect(buttons.length).toBe(2);
            expect(buttons[0]).toHaveTextContent('Close');
            expect(buttons[1]).toHaveTextContent('Close');
        });

        const dialogAfterClickingButton = buttonNumber => {
            const { getAllByRole, getByRole } = render(
                <ErrorDialog />,
                [showDialog('An error occured')],
            );

            const buttons = getAllByRole('button');
            fireEvent.click(buttons[buttonNumber]);

            return () => getByRole('dialog');
        };

        it('of which the first closes the dialog', async () => {
            const getDialog = dialogAfterClickingButton(0);
            await waitForElementToBeRemoved(getDialog);
        });

        it('of which the second closes the dialog', async () => {
            const getDialog = dialogAfterClickingButton(1);
            await waitForElementToBeRemoved(getDialog);
        });
    });
});
