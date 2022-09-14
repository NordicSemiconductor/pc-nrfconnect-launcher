/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';
import { openUrl } from 'pc-nrfconnect-shared';

import { startUpdate } from '../../ipc/launcherUpdate';
import UpdateAvailableDialog from '../components/UpdateAvailableDialog';
import * as AutoUpdateActions from '../features/launcherUpdate/launcherUpdateSlice';

const releaseNotesUrl =
    'https://github.com/NordicSemiconductor/pc-nrfconnect-launcher/releases';

function mapStateToProps(state) {
    const { autoUpdate } = state;

    return {
        isVisible: autoUpdate.isUpdateAvailableDialogVisible,
        version: autoUpdate.latestVersion,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onClickReleaseNotes: () => openUrl(releaseNotesUrl),
        onConfirm: startUpdate,
        onCancel: () => dispatch(AutoUpdateActions.reset()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UpdateAvailableDialog);
