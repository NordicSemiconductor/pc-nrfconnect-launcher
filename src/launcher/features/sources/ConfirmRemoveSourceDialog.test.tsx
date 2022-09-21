/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import render from '../../../testrenderer';
import ConfirmRemoveSourceDialog from './ConfirmRemoveSourceDialog';
import { showRemoveSource } from './sourcesSlice';

describe('ConfirmRemoveSourceDialog', () => {
    it('is initially invisible', () => {
        expect(
            render(<ConfirmRemoveSourceDialog />).baseElement
        ).toMatchSnapshot();
    });

    it('shows the new version if one becomes available ', () => {
        expect(
            render(<ConfirmRemoveSourceDialog />, [
                showRemoveSource('the source to remove'),
            ]).baseElement
        ).toMatchSnapshot();
    });
});
