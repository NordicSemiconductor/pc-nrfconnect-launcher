/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from '../../decoration';
import { hideLegacyAppDialog } from '../actions/legacyAppDialogActions';
import LegacyAppDialog from '../components/LegacyAppDialog';
import { addToDoNotShowLegacyAppDialogAgain } from '../legacyAppWarning';

const mapStateToProps = state => ({
    isVisible: state.core.legacyAppDialog,
});

const mapDispatchToProps = dispatch => ({
    close: () => dispatch(hideLegacyAppDialog()),
    closeAndRemember: () => {
        addToDoNotShowLegacyAppDialogAgain();
        dispatch(hideLegacyAppDialog());
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(
    LegacyAppDialog,
    'LegacyAppDialog'
);
