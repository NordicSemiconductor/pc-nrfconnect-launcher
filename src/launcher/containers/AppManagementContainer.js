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

import { connect } from 'react-redux';
import { openUrl } from 'pc-nrfconnect-shared';

import AppManagementView from '../components/AppManagementView';
import * as AppsActions from '../actions/appsActions';
import * as DesktopShortcutActions from '../actions/desktopShortcutActions';
import * as ReleaseNotes from '../actions/releaseNotesDialogActions';

function mapStateToProps(state) {
    const {
        apps: {
            localApps,
            officialApps,
            installingAppName,
            removingAppName,
            upgradingAppName,
            show,
            filter,
            sources,
        },
    } = state;
    const allApps = localApps.concat(officialApps);
    const apps = allApps
        .filter(
            app =>
                new RegExp(filter, 'i').test(app.displayName) &&
                ((app.isOfficial === true && app.path && show.installed) ||
                    (app.isOfficial === null && !app.path && show.available) ||
                    app.isOfficial === false) &&
                sources[app.source || 'local'] !== false
        )
        .sort((a, b) => {
            const cmpInstalled = !!b.currentVersion - !!a.currentVersion;
            const aName = a.displayName || a.name;
            const bName = b.displayName || b.name;
            return cmpInstalled || aName.localeCompare(bName);
        });

    const allSources = [
        ...new Set(allApps.map(({ source }) => source || 'local')),
    ];
    allSources.forEach(x => {
        if (sources[x] === undefined) {
            sources[x] = true;
        }
    });

    return {
        apps,
        installingAppName,
        removingAppName,
        upgradingAppName,
        isProcessing:
            !!installingAppName || !!upgradingAppName || !!removingAppName,
        show: { ...show },
        filter,
        upgradeableApps: apps.filter(app => app.upgradeAvailable),
        sources,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onInstall: (name, source) =>
            dispatch(AppsActions.installOfficialApp(name, source)),
        onRemove: (name, source) =>
            dispatch(AppsActions.removeOfficialApp(name, source)),
        onReadMore: homepage => openUrl(homepage),
        // Launcher actions
        onAppSelected: app => dispatch(AppsActions.checkEngineAndLaunch(app)),
        onCreateShortcut: app =>
            dispatch(DesktopShortcutActions.createShortcut(app)),
        onShowReleaseNotes: appid => dispatch(ReleaseNotes.show(appid)),
        onUpgrade: (name, version, source) =>
            dispatch(AppsActions.upgradeOfficialApp(name, version, source)),
        setAppManagementShow: show =>
            dispatch(AppsActions.setAppManagementShow(show)),
        setAppManagementFilter: filter =>
            dispatch(AppsActions.setAppManagementFilter(filter)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppManagementView);
