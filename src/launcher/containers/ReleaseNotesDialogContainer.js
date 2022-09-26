/*
 * Copyright (c) 2019 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import { upgradeDownloadableApp } from '../actions/appsActions';
import ReleaseNotesView from '../components/ReleaseNotesDialogView';
import { hide } from '../features/releaseNotes/releaseNotesDialogSlice';

function mapStateToProps({
    apps: { downloadableApps },
    releaseNotesDialog: { source, name },
}) {
    if (name) {
        const app = downloadableApps.find(
            x => x.source === source && x.name === name
        );
        return {
            source: app.source,
            name: app.name,
            displayName: app.displayName,
            releaseNote: app.releaseNote,
            canUpdate: app.currentVersion !== app.latestVersion,
            latestVersion: app.latestVersion,
            isInstalled: app.currentVersion != null,
        };
    }

    return {};
}

function mapDispatchToProps(dispatch) {
    return {
        onUpgrade: (name, version, source) =>
            dispatch(upgradeDownloadableApp(name, version, source)),
        onHideReleaseNotes: () => dispatch(hide()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ReleaseNotesView);
