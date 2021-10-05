/*
 * Copyright (c) 2019 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import { upgradeOfficialApp } from '../actions/appsActions';
import * as ReleaseNotes from '../actions/releaseNotesDialogActions';
import ReleaseNotesView from '../components/ReleaseNotesDialogView';

function mapStateToProps({
    apps: { officialApps },
    releaseNotesDialog: { source, name },
}) {
    if (name) {
        const app = officialApps.find(
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
            dispatch(upgradeOfficialApp(name, version, source)),
        onHideReleaseNotes: () => dispatch(ReleaseNotes.hide()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ReleaseNotesView);
