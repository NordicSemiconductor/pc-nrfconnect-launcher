/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';
import { openUrl } from 'pc-nrfconnect-shared';

import { sendStartUpdateFromRender as startLauncherUpdate } from '../../ipc/launcherUpdate';
import * as AutoUpdateActions from '../actions/autoUpdateActions';
import UpdateAvailableDialog from '../components/UpdateAvailableDialog';
import mainConfig from '../util/mainConfig';

function mapStateToProps(state) {
    const { autoUpdate } = state;

    return {
        isVisible: autoUpdate.isUpdateAvailableDialogVisible,
        version: autoUpdate.latestVersion,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onClickReleaseNotes: () => openUrl(mainConfig().releaseNotesUrl),
        onConfirm: startLauncherUpdate,
        onCancel: () => dispatch(AutoUpdateActions.resetAction()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UpdateAvailableDialog);
