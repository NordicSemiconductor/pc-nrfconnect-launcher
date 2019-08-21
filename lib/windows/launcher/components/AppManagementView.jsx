/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
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
import PropTypes from 'prop-types';
import { Iterable } from 'immutable';
import AppItem from './AppItem';

function getSortedApps(apps) {
    return apps.sort((a, b) => {
        const cmpInstalled = (!!b.currentVersion - !!a.currentVersion);
        const aName = a.displayName || a.name;
        const bName = b.displayName || b.name;
        return cmpInstalled || aName.localeCompare(bName);
    });
}

class AppManagementView extends React.Component {
    componentDidMount() {
        const {
            onMount,
            isLatestAppInfoDownloaded,
            isSkipUpdateApps,
            onDownloadLatestAppInfo,
        } = this.props;

        onMount();

        if (!isLatestAppInfoDownloaded && !isSkipUpdateApps) {
            onDownloadLatestAppInfo();
        }
    }

    isProcessing() {
        const {
            installingAppName,
            upgradingAppName,
            removingAppName,
        } = this.props;
        return !!installingAppName || !!upgradingAppName || !!removingAppName;
    }

    render() {
        const {
            activeModal,
            apps,
            installingAppName,
            upgradingAppName,
            removingAppName,
            onInstall,
            onRemove,
            onUpgrade,
            onReadMore,
            onAppSelected,
            onCreateShortcut,
            onHideModal,
            onShowModal,
        } = this.props;
        const isProcessing = this.isProcessing();

        return getSortedApps(apps).map(app => (
            <AppItem
                activeModal={activeModal}
                key={`${app.name}-${app.source}`}
                app={app}
                isDisabled={isProcessing}
                isInstalling={installingAppName === app.name}
                isUpgrading={upgradingAppName === app.name}
                isRemoving={removingAppName === app.name}
                onRemove={() => onRemove(app.name, app.source)}
                onInstall={() => onInstall(app.name, app.source)}
                onUpgrade={() => onUpgrade(
                    app.name, app.latestVersion, app.source,
                )}
                onReadMore={() => onReadMore(app.homepage)}
                onAppSelected={() => onAppSelected(app)}
                onCreateShortcut={() => onCreateShortcut(app)}
                onHideModal={onHideModal}
                onShowModal={onShowModal}
            />
        ));
    }
}

AppManagementView.propTypes = {
    activeModal: PropTypes.string.isRequired,
    apps: PropTypes.instanceOf(Iterable).isRequired,
    isSkipUpdateApps: PropTypes.bool,
    isLatestAppInfoDownloaded: PropTypes.bool.isRequired,
    installingAppName: PropTypes.string,
    upgradingAppName: PropTypes.string,
    removingAppName: PropTypes.string,
    onMount: PropTypes.func,
    onInstall: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onUpgrade: PropTypes.func.isRequired,
    onReadMore: PropTypes.func.isRequired,
    onDownloadLatestAppInfo: PropTypes.func,
    onAppSelected: PropTypes.func.isRequired,
    onCreateShortcut: PropTypes.func.isRequired,
    onHideModal: PropTypes.func.isRequired,
    onShowModal: PropTypes.func.isRequired,
};

AppManagementView.defaultProps = {
    installingAppName: '',
    upgradingAppName: '',
    removingAppName: '',
    isSkipUpdateApps: false,
    onMount: () => {},
    onDownloadLatestAppInfo: () => {},
};

export default AppManagementView;
