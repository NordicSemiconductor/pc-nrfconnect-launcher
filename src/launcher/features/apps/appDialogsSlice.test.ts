/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import dispatchTo from '@nordicsemiconductor/pc-nrfconnect-shared/test/dispatchTo';
import { combineReducers } from 'redux';

import { createDownloadableTestApp } from '../../../test/testFixtures';
import { reducer as rootReducer } from '../../store';
import {
    getConfirmLaunchDialog,
    hideConfirmLaunchDialog,
    showConfirmLaunchDialog,
} from './appDialogsSlice';

const app = createDownloadableTestApp();

const reducer = combineReducers(rootReducer);

describe('app dialogs slice', () => {
    describe('confirm dialog', () => {
        it('signals when the dialog is shown', () => {
            const initialState = dispatchTo(reducer);
            expect(getConfirmLaunchDialog(initialState).isVisible).toEqual(
                false
            );

            const dialogIsShown = dispatchTo(reducer, [
                showConfirmLaunchDialog({
                    text: 'Do you confirm?',
                    app,
                }),
            ]);
            expect(getConfirmLaunchDialog(dialogIsShown).isVisible).toEqual(
                true
            );

            const dialogIsClosed = reducer(
                dialogIsShown,
                hideConfirmLaunchDialog()
            );
            expect(getConfirmLaunchDialog(dialogIsClosed).isVisible).toEqual(
                false
            );
        });

        it('has right properties', () => {
            const state = dispatchTo(reducer, [
                showConfirmLaunchDialog({
                    text: 'Do you confirm?',
                    app,
                }),
            ]);
            expect(getConfirmLaunchDialog(state)).toMatchObject({
                text: 'Do you confirm?',
                app,
            });
        });
    });
});
