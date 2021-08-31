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
import { bool, func } from 'prop-types';

import ConfirmationDialog from '../../components/ConfirmationDialog';

const LegacyAppDialog = ({ isVisible, close, closeAndRemember }) => (
    <ConfirmationDialog
        dimBackground
        isVisible={isVisible}
        okButtonText="Do not remind me again"
        onOk={closeAndRemember}
        title="Outdated app"
        onCancel={close}
    >
        <p>
            This app in its current form will not be supported by future
            versions of nRF Connect for Desktop.
        </p>
        <p>
            As a user of this app, please have a look for an updated version of
            this app. If the developers do not provide a new version, consider
            to remind them that they need to release an updated version of their
            app.
        </p>
        <p>
            As an app developer, be aware that you need to update your app,
            otherwise it might cease to work with future versions of nRF Connect
            for Desktop. Follow the instructions at{' '}
            <a
                href="https://nordicsemiconductor.github.io/pc-nrfconnect-docs/migrating_apps"
                target="_blank"
                rel="noreferrer"
            >
                https://nordicsemiconductor.github.io/pc-nrfconnect-docs/migrating_apps
            </a>{' '}
            to update your app and release a new version in time to your users.
        </p>
    </ConfirmationDialog>
);

LegacyAppDialog.propTypes = {
    isVisible: bool.isRequired,
    close: func.isRequired,
    closeAndRemember: func.isRequired,
};

export default LegacyAppDialog;
