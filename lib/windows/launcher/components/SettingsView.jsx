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
import { Checkbox } from 'react-bootstrap';
import moment from 'moment';

class SettingsView extends React.Component {
    constructor() {
        super();
        this.onCheckUpdatesAtStartupChanged = this.onCheckUpdatesAtStartupChanged.bind(this);
        this.onTriggerUpdateCheckClicked = this.onTriggerUpdateCheckClicked.bind(this);
    }

    componentDidMount() {
        this.props.onMount();
    }

    onCheckUpdatesAtStartupChanged(event) {
        const { onCheckUpdatesAtStartupChanged } = this.props;
        onCheckUpdatesAtStartupChanged(event.target.checked);
    }

    onTriggerUpdateCheckClicked() {
        this.props.onTriggerUpdateCheck();
    }

    render() {
        const {
            isLoading,
            shouldCheckForUpdatesAtStartup,
            isCheckingForUpdates,
            lastUpdateCheckDate,
        } = this.props;

        const checkButtonText = isCheckingForUpdates ? 'Checking...' : 'Check for updates now';

        return !isLoading ? (
            <div>
                <div className="core-settings-section">
                    <h4>Updates</h4>
                    {
                        lastUpdateCheckDate ?
                            <p>Last update check performed: { moment(lastUpdateCheckDate).format('YYYY-MM-DD HH:mm:ss') }</p> :
                            null
                    }
                    <div className="core-settings-update-check-controls">
                        <Checkbox
                            checked={shouldCheckForUpdatesAtStartup}
                            onChange={this.onCheckUpdatesAtStartupChanged}
                        >
                            Check for updates at startup
                        </Checkbox>
                        <button
                            title={checkButtonText}
                            className="btn btn-primary core-btn"
                            onClick={this.onTriggerUpdateCheckClicked}
                            disabled={isCheckingForUpdates}
                        >
                            <span className="glyphicon glyphicon-refresh" />
                            <span className="core-btn-text">
                                { checkButtonText }
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        ) : <div />;
    }
}

SettingsView.propTypes = {
    onMount: PropTypes.func,
    isLoading: PropTypes.bool.isRequired,
    shouldCheckForUpdatesAtStartup: PropTypes.bool.isRequired,
    isCheckingForUpdates: PropTypes.bool.isRequired,
    onCheckUpdatesAtStartupChanged: PropTypes.func.isRequired,
    onTriggerUpdateCheck: PropTypes.func.isRequired,
    lastUpdateCheckDate: PropTypes.instanceOf(Date),
};

SettingsView.defaultProps = {
    onMount: () => {},
    lastUpdateCheckDate: null,
};

export default SettingsView;
