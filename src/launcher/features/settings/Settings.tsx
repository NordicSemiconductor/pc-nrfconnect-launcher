/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import WithScrollbarContainer from '../../util/WithScrollbarContainer';
import AddSourceDialog from '../sources/AddSourceDialog';
import ConfirmRemoveSourceDialog from '../sources/ConfirmRemoveSourceDialog';
import AddArtifactoryTokenDialog from './AddArtifactoryTokenDialog';
import AppSources from './Cards/AppSources';
import ArtifactoryToken from './Cards/ArtifactoryToken';
import Updates from './Cards/Updates';
import UsageStatistics from './Cards/UsageStatistics';
import UpdateCheckCompleteDialog from './UpdateCheckCompleteDialog';

export default () => (
    <WithScrollbarContainer>
        <div className="settings-pane-container">
            <Updates />
            <AppSources />
            <ArtifactoryToken />
            <UsageStatistics />

            <UpdateCheckCompleteDialog />
            <AddSourceDialog />
            <ConfirmRemoveSourceDialog />
            <AddArtifactoryTokenDialog />
        </div>
    </WithScrollbarContainer>
);
