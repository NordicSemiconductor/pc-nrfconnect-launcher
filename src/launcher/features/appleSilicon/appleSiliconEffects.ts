/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { telemetry } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { setDoNotShowAppleSiliconWarning } from '../../../common/persistedStore';
import type { AppThunk } from '../../store';
import { hideAppleSiliconDialog } from './appleSiliconSlice';

export const download = (): AppThunk => dispatch => {
    telemetry.sendEvent('Apple Silicon Warning', {
        ignored: false,
    });
    dispatch(hideAppleSiliconDialog());
};

export const ignore = (): AppThunk => dispatch => {
    telemetry.sendEvent('Apple Silicon Warning', {
        ignored: true,
        permanent: false,
    });
    dispatch(hideAppleSiliconDialog());
};

export const doNotShowAgain = (): AppThunk => dispatch => {
    telemetry.sendEvent('Apple Silicon Warning', {
        ignored: true,
        permanent: true,
    });
    dispatch(hideAppleSiliconDialog());
    setDoNotShowAppleSiliconWarning();
};
