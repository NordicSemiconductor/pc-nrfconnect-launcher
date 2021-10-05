/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';
import { remote } from 'electron';
import { openUrl } from 'pc-nrfconnect-shared';

import * as AutoUpdateActions from '../actions/autoUpdateActions';
import UpdateAvailableDialog from '../components/UpdateAvailableDialog';

const config = remote.require('../main/config');

function mapStateToProps(state) {
    const { autoUpdate } = state;

    return {
        isVisible: autoUpdate.isUpdateAvailableDialogVisible,
        version: autoUpdate.latestVersion,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onClickReleaseNotes: () => openUrl(config.getReleaseNotesUrl()),
        onConfirm: () => dispatch(AutoUpdateActions.startDownload()),
        onCancel: () => dispatch(AutoUpdateActions.postponeUpdate()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UpdateAvailableDialog);
