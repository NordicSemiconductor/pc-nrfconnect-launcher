/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
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
