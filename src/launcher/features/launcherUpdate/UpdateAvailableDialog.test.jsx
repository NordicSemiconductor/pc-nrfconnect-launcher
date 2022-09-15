/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import render from '../../../testrenderer';
import UpdateAvailableDialog from '../../containers/UpdateAvailableContainer';
import { updateAvailable } from './launcherUpdateSlice';

describe('UpdateAvailableDialog', () => {
    it('is initially invisible', () => {
        expect(render(<UpdateAvailableDialog />).baseElement).toMatchSnapshot();
    });

    it('shows the new version if one becomes available ', () => {
        expect(
            render(<UpdateAvailableDialog />, [updateAvailable('1.2.3')])
                .baseElement
        ).toMatchSnapshot();
    });
});
