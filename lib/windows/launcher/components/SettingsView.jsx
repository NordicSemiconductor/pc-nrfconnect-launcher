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
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { clipboard } from 'electron';
import moment from 'moment';
import UpdateCheckCompleteDialog from './UpdateCheckCompleteDialog';
import InputLineDialog from './InputLineDialog';
import ConfirmRemoveSourceDialog from '../containers/ConfirmRemoveSourceDialog';

const CopyToClipboard = ({ text }) => (
    <Button
        size="sm"
        variant="light"
        title="Copy to clipboard"
        onClick={() => clipboard.writeText(text)}
    >
        <span className="mdi mdi-content-copy" />
    </Button>
);

CopyToClipboard.propTypes = {
    text: PropTypes.string.isRequired,
};

function cancel(event) {
    event.preventDefault();
    const { dataTransfer } = event;
    dataTransfer.dropEffect = 'copy';
    return false;
}

class SettingsView extends React.Component {
    constructor() {
        super();
        this.onCheckUpdatesAtStartupChanged = this.onCheckUpdatesAtStartupChanged.bind(this);
        this.onTriggerUpdateCheckClicked = this.onTriggerUpdateCheckClicked.bind(this);
    }

    componentDidMount() {
        const { onMount } = this.props;
        onMount();
    }

    onCheckUpdatesAtStartupChanged(event) {
        const { onCheckUpdatesAtStartupChanged } = this.props;
        onCheckUpdatesAtStartupChanged(event.target.checked);
    }

    onTriggerUpdateCheckClicked() {
        const { onTriggerUpdateCheck } = this.props;
        onTriggerUpdateCheck();
    }

    onDropUrl(event) {
        const { addSource } = this.props;
        event.preventDefault();
        const url = event.dataTransfer.getData('Text');
        addSource(url);
    }

    render() {
        const {
            isLoading,
            shouldCheckForUpdatesAtStartup,
            isCheckingForUpdates,
            lastUpdateCheckDate,
            isUpdateCheckCompleteDialogVisible,
            onHideUpdateCheckCompleteDialog,
            isAppUpdateAvailable,
            sources,
            addSource,
            isAddSourceDialogVisible,
            onShowAddSourceDialog,
            onHideAddSourceDialog,
            onShowRemoveSourceDialog,
        } = this.props;

        const checkButtonText = isCheckingForUpdates ? 'Checking...' : 'Check for updates now';
        const sourcesJS = sources.toJS();

        return !isLoading ? (
            <div>
                <div className="core-settings-section">
                    <h4>Updates</h4>
                    {
                        lastUpdateCheckDate
                            ? <p>Last update check performed: { moment(lastUpdateCheckDate).format('YYYY-MM-DD HH:mm:ss') }</p>
                            : null
                    }
                    <div className="core-settings-update-check-controls">
                        <Form.Group controlId="checkForUpdates">
                            <Form.Check
                                type="checkbox"
                                checked={shouldCheckForUpdatesAtStartup}
                                onChange={this.onCheckUpdatesAtStartupChanged}
                                label="Check for updates at startup"
                            />
                        </Form.Group>
                        <Button
                            title={checkButtonText}
                            className="btn btn-primary core-btn"
                            onClick={this.onTriggerUpdateCheckClicked}
                            disabled={isCheckingForUpdates}
                        >
                            <span className="mdi mdi-sync" />
                            <span className="core-btn-text">
                                { checkButtonText }
                            </span>
                        </Button>
                    </div>
                </div>
                {
                    isUpdateCheckCompleteDialogVisible && (
                        <UpdateCheckCompleteDialog
                            isVisible
                            isAppUpdateAvailable={isAppUpdateAvailable}
                            onOk={onHideUpdateCheckCompleteDialog}
                        />
                    )
                }
                <div
                    className="core-settings-section"
                    onDrop={event => this.onDropUrl(event)}
                    onDragOver={cancel}
                    onDragEnter={cancel}
                >
                    <h4>Extra app sources</h4>
                    <table className="core-settings-sources">
                        <tbody>
                            {
                                Object.keys(sourcesJS)
                                    .filter(name => name !== 'official')
                                    .map(name => (
                                        <tr key={name} className="core-settings-source">
                                            <td className="core-settings-source-name">{name}</td>
                                            <td className="core-settings-copy-to-clipboard">
                                                <CopyToClipboard text={sourcesJS[name]} />
                                            </td>
                                            <td
                                                className="core-settings-source-url selectable"
                                                title={sourcesJS[name]}
                                            >
                                                {sourcesJS[name]}
                                            </td>
                                            <td className="core-settings-source-remove">
                                                <Button
                                                    className="core-btn"
                                                    variant="light"
                                                    size="sm"
                                                    onClick={() => onShowRemoveSourceDialog(name)}
                                                >
                                                    <span className="mdi mdi-playlist-remove" />
                                                    <span className="core-btn-text">
                                                        Remove
                                                    </span>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                            }
                        </tbody>
                    </table>
                    <div className="core-settings-sources-controls">
                        <Button
                            className="btn btn-primary core-btn"
                            onClick={onShowAddSourceDialog}
                        >
                            <span className="mdi mdi-playlist-plus" />
                            <span className="core-btn-text">
                                Add source
                            </span>
                        </Button>
                    </div>
                </div>
                {
                    isAddSourceDialogVisible && (
                        <InputLineDialog
                            isVisible
                            title="Add new nRFConnect app source url"
                            label="URL of apps.json"
                            placeholder="URL..."
                            onOk={url => { addSource(url); onHideAddSourceDialog(); }}
                            onCancel={onHideAddSourceDialog}
                        />
                    )
                }
                <ConfirmRemoveSourceDialog />
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
    isUpdateCheckCompleteDialogVisible: PropTypes.bool,
    onHideUpdateCheckCompleteDialog: PropTypes.func.isRequired,
    isAppUpdateAvailable: PropTypes.bool,
    sources: PropTypes.shape({}).isRequired,
    addSource: PropTypes.func.isRequired,
    onShowRemoveSourceDialog: PropTypes.func.isRequired,
    isAddSourceDialogVisible: PropTypes.bool,
    onShowAddSourceDialog: PropTypes.func.isRequired,
    onHideAddSourceDialog: PropTypes.func.isRequired,
};

SettingsView.defaultProps = {
    onMount: () => {},
    lastUpdateCheckDate: null,
    isUpdateCheckCompleteDialogVisible: false,
    isAppUpdateAvailable: false,
    isAddSourceDialogVisible: false,
};

export default SettingsView;
