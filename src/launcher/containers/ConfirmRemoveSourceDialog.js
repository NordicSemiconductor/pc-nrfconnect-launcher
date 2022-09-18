/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import ConfirmRemoveSourceDialog from '../components/ConfirmRemoveSourceDialog';
import { removeSource } from '../features/settings/settingsEffects';
import { hideRemoveSourceDialog } from '../features/settings/settingsSlice';

function mapStateToProps(state) {
    return {
        source: state.settings.removeSource,
        isVisible: state.settings.isRemoveSourceDialogVisible,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onConfirm: source => {
            dispatch(hideRemoveSourceDialog());
            dispatch(removeSource(source));
        },
        onCancel: () => dispatch(hideRemoveSourceDialog()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ConfirmRemoveSourceDialog);
