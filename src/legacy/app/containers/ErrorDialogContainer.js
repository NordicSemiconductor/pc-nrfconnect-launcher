/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as ErrorDialogActions from '../../actions/errorDialogActions';
import ErrorDialog from '../../components/ErrorDialog';
import { connect } from '../../decoration';

function mapStateToProps(state) {
    const { errorDialog } = state.core;

    return {
        messages: errorDialog.messages,
        isVisible: errorDialog.isVisible,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onClose: () => dispatch(ErrorDialogActions.hideDialog()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    ErrorDialog,
    'ErrorDialog'
);
