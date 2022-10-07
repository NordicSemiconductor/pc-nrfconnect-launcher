/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { array, bool } from 'prop-types';

import WithScrollbarContainer from '../containers/WithScrollbarContainer';
import App from '../features/apps/App';
import AppFilterBar from '../features/filter/AppFilterBar';
import ReleaseNotesDialog from '../features/releaseNotes/ReleaseNotesDialog';

const AppManagementView = ({ apps, isProcessing }) => (
    <>
        <AppFilterBar />
        <WithScrollbarContainer hasFilter>
            {apps.map(app => (
                <App
                    key={`${app.name}-${app.source}`}
                    app={app}
                    isDisabled={isProcessing}
                />
            ))}
        </WithScrollbarContainer>

        <ReleaseNotesDialog />
    </>
);

AppManagementView.propTypes = {
    apps: array.isRequired, // eslint-disable-line react/forbid-prop-types
    isProcessing: bool,
};

AppManagementView.defaultProps = {
    isProcessing: false,
};

export default AppManagementView;
