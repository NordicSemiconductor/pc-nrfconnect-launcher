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
import AppItemButton from './AppItemButton';

const InstalledAppItem = ({
    app,
    onRemove,
    onUpgrade,
    onReadMore,
    isUpgrading,
    isRemoving,
    isDisabled,
}) => {
    const isUpgradeAvailable = app.latestVersion && app.currentVersion !== app.latestVersion;
    const statusClass = isUpgradeAvailable ? 'upgrade-available' : 'installed';
    const statusText = isUpgradeAvailable ? 'Upgrade available' : 'Installed';
    return (
        <div className="core-app-management-item list-group-item">
            <h4 className="list-group-item-heading">{app.displayName || app.name}
                <span className="list-group-item-heading-source-tag">{app.source}</span>
            </h4>
            <div className="list-group-item-text">
                <p>{app.description}</p>
                <div className="core-app-management-item-footer">
                    <button className="btn btn-link core-btn-link" onClick={onReadMore} type="button">
                        More information
                    </button>
                    <div className={`core-app-management-item-status ${statusClass}`}>{ statusText }</div>
                    <div className="core-app-management-item-buttons">
                        {
                            isUpgradeAvailable
                                ? (
                                    <AppItemButton
                                        title={`Upgrade ${app.displayName || app.name} from v${app.currentVersion} to v${app.latestVersion}`}
                                        text={isUpgrading ? 'Upgrading...' : 'Upgrade'}
                                        iconClass="mdi mdi-download"
                                        isDisabled={isDisabled}
                                        onClick={onUpgrade}
                                    />
                                )
                                : <div />
                        }
                        <AppItemButton
                            title={`Remove ${app.displayName || app.name}`}
                            text={isRemoving ? 'Removing...' : 'Remove'}
                            iconClass="mdi mdi-trash-can"
                            isDisabled={isDisabled}
                            onClick={onRemove}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

InstalledAppItem.propTypes = {
    app: PropTypes.shape({
        name: PropTypes.string.isRequired,
        displayName: PropTypes.string,
        description: PropTypes.string.isRequired,
        homepage: PropTypes.string,
        currentVersion: PropTypes.string.isRequired,
        latestVersion: PropTypes.string.isRequired,
    }).isRequired,
    isUpgrading: PropTypes.bool,
    isRemoving: PropTypes.bool,
    isDisabled: PropTypes.bool,
    onRemove: PropTypes.func.isRequired,
    onUpgrade: PropTypes.func.isRequired,
    onReadMore: PropTypes.func.isRequired,
};

InstalledAppItem.defaultProps = {
    isDisabled: false,
    isUpgrading: false,
    isRemoving: false,
};

export default InstalledAppItem;
