/* Copyright (c) 2015 - 2019, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React from 'react';
import { Iterable } from 'immutable';
import { bool, func, instanceOf, string } from 'prop-types';

import AppManagementFilter from '../containers/AppManagementFilterContainer';
import ReleaseNotesDialog from '../containers/ReleaseNotesDialogContainer';
import AppItem from './AppItem';

const AppManagementView = ({
    apps,
    sources,
    installingAppName,
    upgradingAppName,
    removingAppName,
    isProcessing,
    onInstall,
    onRemove,
    onReadMore,
    onAppSelected,
    onCreateShortcut,
    onShowReleaseNotes,
}) => (
    <>
        <AppManagementFilter apps={apps} sources={sources} />
        {apps.map(app => (
            <AppItem
                key={`${app.name}-${app.source}`}
                app={app}
                isDisabled={isProcessing}
                isInstalling={installingAppName === `${app.source}/${app.name}`}
                isUpgrading={upgradingAppName === `${app.source}/${app.name}`}
                isRemoving={removingAppName === `${app.source}/${app.name}`}
                onRemove={() => onRemove(app.name, app.source)}
                onInstall={() => onInstall(app.name, app.source)}
                onReadMore={() => onReadMore(app.homepage)}
                onAppSelected={() => onAppSelected(app)}
                onCreateShortcut={() => onCreateShortcut(app)}
                onShowReleaseNotes={() => onShowReleaseNotes(app)}
            />
        ))}
        <ReleaseNotesDialog />
    </>
);

AppManagementView.propTypes = {
    apps: instanceOf(Iterable).isRequired,
    sources: instanceOf(Object).isRequired,
    installingAppName: string,
    upgradingAppName: string,
    removingAppName: string,
    isProcessing: bool,
    onInstall: func.isRequired,
    onRemove: func.isRequired,
    onReadMore: func.isRequired,
    onAppSelected: func.isRequired,
    onCreateShortcut: func.isRequired,
    onShowReleaseNotes: func.isRequired,
};

AppManagementView.defaultProps = {
    installingAppName: '',
    upgradingAppName: '',
    removingAppName: '',
    isProcessing: false,
};

export default AppManagementView;
