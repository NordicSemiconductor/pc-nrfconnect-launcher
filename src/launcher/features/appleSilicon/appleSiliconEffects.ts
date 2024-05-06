/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { telemetry } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { setDoNotShowAppleSiliconWarning } from '../../../ipc/persistedStore';
import type { AppThunk } from '../../store';
import { hideAppleSiliconDialog } from './appleSiliconSlice';

export const confirm = (): AppThunk => dispatch => {
    telemetry.sendEvent('IgnoreAppleSiliconWarning', {
        permanent: false,
    });
    dispatch(hideAppleSiliconDialog());
};

export const doNotShowAgain = (): AppThunk => dispatch => {
    telemetry.sendEvent('IgnoreAppleSiliconWarning', {
        permanent: false,
    });
    dispatch(hideAppleSiliconDialog());
    setDoNotShowAppleSiliconWarning();
};
