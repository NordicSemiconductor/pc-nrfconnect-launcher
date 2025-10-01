/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import render from '../../../test/testrenderer';
import { updateAvailable } from './launcherUpdateSlice';
import UpdateAvailableDialog from './UpdateAvailableDialog';

describe('UpdateAvailableDialog', () => {
    it('is initially invisible', () => {
        expect(render(<UpdateAvailableDialog />).baseElement).toMatchSnapshot();
    });

    it('shows the new version if one becomes available ', () => {
        expect(
            render(<UpdateAvailableDialog />, [updateAvailable('1.2.3')])
                .baseElement,
        ).toMatchSnapshot();
    });
});
