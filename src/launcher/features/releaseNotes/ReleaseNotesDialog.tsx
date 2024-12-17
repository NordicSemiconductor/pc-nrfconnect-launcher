/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import {
    DialogButton,
    GenericDialog,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    App,
    InstalledDownloadableApp,
    isDownloadable,
    isInstalled,
    isUpdatable,
    isWithdrawn,
    UninstalledDownloadableApp,
} from '../../../ipc/apps';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { updateDownloadableApp } from '../apps/appsEffects';
import { getDownloadableApp } from '../apps/appsSlice';
import { getReleaseNotesDialog, hide } from './releaseNotesDialogSlice';

const canBeInstalledOrUpdated = (
    app?: App
): app is InstalledDownloadableApp | UninstalledDownloadableApp =>
    isDownloadable(app) && (!isInstalled(app) || isUpdatable(app));

export default () => {
    const dispatch = useLauncherDispatch();
    const appToDisplay = useLauncherSelector(getReleaseNotesDialog);
    const app = useLauncherSelector(getDownloadableApp(appToDisplay));

    if (isWithdrawn(app)) {
        return null;
    }

    const isVisible = appToDisplay.name != null;

    const hideDialog = () => dispatch(hide());

    return (
        <GenericDialog
            key="releaseNotes"
            onHide={hideDialog}
            closeOnEsc
            isVisible={isVisible}
            title={`Release notes for ${app?.displayName ?? appToDisplay.name}`}
            size="lg"
            footer={
                <>
                    {canBeInstalledOrUpdated(app) && (
                        <DialogButton
                            variant="primary"
                            onClick={() => {
                                dispatch(updateDownloadableApp(app));
                                hideDialog();
                            }}
                        >
                            {isInstalled(app)
                                ? 'Update to latest version'
                                : 'Install'}
                        </DialogButton>
                    )}
                    <DialogButton onClick={hideDialog}>Close</DialogButton>
                </>
            }
        >
            <div className="release-notes">
                <ReactMarkdown linkTarget="_blank">
                    {app?.releaseNotes ?? ''}
                </ReactMarkdown>
            </div>
        </GenericDialog>
    );
};
