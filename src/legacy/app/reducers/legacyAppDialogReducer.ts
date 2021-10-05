/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    LEGACY_APP_DIALOG_HIDE,
    LEGACY_APP_DIALOG_SHOW_MAYBE,
    LegacyAppAction,
} from '../actions/legacyAppDialogActions';
import {
    sendUsageDataForLegacyApp,
    showWarningForCurrentApp,
} from '../legacyAppWarning';

const reducer = (state = false, action: LegacyAppAction) => {
    switch (action.type) {
        case LEGACY_APP_DIALOG_SHOW_MAYBE: {
            const showDialog = showWarningForCurrentApp();
            if (showDialog) {
                sendUsageDataForLegacyApp();
            }
            return showDialog;
        }
        case LEGACY_APP_DIALOG_HIDE:
            return false;
        default:
            return state;
    }
};

export default reducer;
