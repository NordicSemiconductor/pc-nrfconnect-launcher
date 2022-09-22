/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { getApps } from '../../reducers/appsReducer';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import {
    getIsUpdateCheckCompleteVisible,
    hideUpdateCheckComplete,
} from './settingsSlice';

export default () => {
    const dispatch = useLauncherDispatch();

    const isVisible = useLauncherSelector(getIsUpdateCheckCompleteVisible);

    const { downloadableApps } = useLauncherSelector(getApps);
    const isAppUpdateAvailable = !!downloadableApps.find(
        app => app.currentVersion && app.currentVersion !== app.latestVersion
    );

    const hideDialog = () => dispatch(hideUpdateCheckComplete());

    return (
        <Modal show={isVisible} onHide={hideDialog}>
            <Modal.Header>
                <Modal.Title>Update check completed</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {isAppUpdateAvailable ? (
                    <>
                        One or more updates are available. Go to the apps screen
                        to update.
                    </>
                ) : (
                    <>All apps are up to date.</>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-primary" onClick={hideDialog}>
                    Got it
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
