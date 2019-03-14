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
import AppIcon from './AppIcon';
import AppItemButton from './AppItemButton';
import AppItemGroup from './AppItemGroup';

const LaunchableAppItem = ({ app, onClick, onCreateShortcut }) => (
    <div className="core-app-launch-item list-group-item">
        <AppIcon
            app={app}
        />
        <div>
            <h4 className="list-group-item-heading">{app.displayName || app.name}</h4>
            <p className="list-group-item-text">
                {app.isOfficial ? app.source : 'local'}, v{app.currentVersion}
            </p>
        </div>
        <div className="core-app-launch-item-buttons btn-toolbar">
            <AppItemButton
                text="Launch"
                title="Launch app"
                iconClass="mdi mdi-play"
                onClick={onClick}
            />
            <AppItemGroup
                title=""
                className="core-app-item-group"
                onCreateShortcut={onCreateShortcut}
            />
        </div>
    </div>
);

LaunchableAppItem.propTypes = {
    app: PropTypes.shape({
        name: PropTypes.string.isRequired,
        displayName: PropTypes.string,
        currentVersion: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
        iconPath: PropTypes.string,
        shortcutIconPath: PropTypes.string,
        isOfficial: PropTypes.bool.isRequired,
        engineVersion: PropTypes.string,
        isSupportedEngine: PropTypes.bool,
        source: PropTypes.string,
    }).isRequired,
    onClick: PropTypes.func.isRequired,
    onCreateShortcut: PropTypes.func.isRequired,
};

LaunchableAppItem.defaultProps = {
};

export default LaunchableAppItem;
