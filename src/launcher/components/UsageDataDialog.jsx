/* Copyright (c) 2015 - 2018, Nordic Semiconductor ASA
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
import { ConfirmationDialog } from 'pc-nrfconnect-shared';

const UsageDataPolicy = (
    <div className="user-data-policy">
        <p>
            You can help improve nRF Connect for Desktop by sending Nordic
            Semiconductor anonymous statistics on how you interact with the app.
            You can enable/disable this feature at any time in Settings.
        </p>
        <h5>What kind of information do we collect?</h5>
        <p>Anonymous aggregation of software and operational info including:</p>
        <ul>
            <li>Launcher, app, and module version</li>
            <li>Installing, launching, and removing apps</li>
            <li>App operations such as selecting and using the device</li>
        </ul>
        <p>
            Anonymous system information such as which operating system is used.
        </p>
        <p>
            Anonymous device information including device and chip type, but not
            identifying information like serial number.
        </p>
        <h5>How do we use this information?</h5>
        <p>
            The information is used to analyze user interaction with nRF Connect
            for desktop and determine areas of improvement.
        </p>

        <h5>How is this information processed and shared?</h5>
        <p>
            Google Analytics is used for collecting and processing the data. All
            data collected is anonymous and no personal data is ever collected.
            IP address is set to anonymized when using Google Analytics.
        </p>
        <p>
            We do not share the data to any third-party companies or individuals
            other than Google Analytics.
        </p>
    </div>
);
const UsageDataDialog = ({ isVisible, onConfirm, onCancel }) => (
    <ConfirmationDialog
        isVisible={isVisible}
        title="Help us improve nRF Connect for Desktop"
        okButtonText="Accept"
        cancelButtonText="Decline"
        onOk={onConfirm}
        onCancel={onCancel}
    >
        {UsageDataPolicy}
    </ConfirmationDialog>
);

UsageDataDialog.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

UsageDataDialog.defaultProps = {};

export default UsageDataDialog;
