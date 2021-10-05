/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import * as SettingsActions from '../actions/settingsActions';
import ConfirmRemoveSourceDialog from '../components/ConfirmRemoveSourceDialog';

function mapStateToProps(state) {
    return {
        source: state.settings.removeSource,
        isVisible: state.settings.isRemoveSourceDialogVisible,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onConfirm: source => {
            dispatch(SettingsActions.hideRemoveSourceDialog());
            dispatch(SettingsActions.removeSource(source));
        },
        onCancel: () => dispatch(SettingsActions.hideRemoveSourceDialog()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ConfirmRemoveSourceDialog);
