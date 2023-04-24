/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useMemo, useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { ConfirmationDialog } from 'pc-nrfconnect-shared';
import { rsort } from 'semver';

import { DownloadableApp } from '../../../ipc/apps';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import {
    getInstallOtherVersionDialog,
    hideInstallOtherVersionDialog,
} from './appDialogsSlice';
import { installDownloadableApp } from './appsEffects';

const VersionList = ({
    versionToInstall,
    setVersionToInstall,
    app,
}: {
    versionToInstall?: string;
    setVersionToInstall: (version: string) => void;
    app?: DownloadableApp;
}) => {
    const availableVersions = useMemo(
        () => rsort(Object.keys(app?.versions ?? {})),
        [app]
    );

    return (
        <Dropdown
            as="span"
            className="ml-3"
            onSelect={version => {
                if (version != null) {
                    setVersionToInstall(version);
                }
            }}
        >
            <Dropdown.Toggle variant="outline-secondary">
                {versionToInstall}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {availableVersions.map(version => (
                    <Dropdown.Item key={version} eventKey={version}>
                        {version}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default () => {
    const dispatch = useLauncherDispatch();
    const installOtherVersionDialog = useLauncherSelector(
        getInstallOtherVersionDialog
    );
    const [versionToInstall, setVersionToInstall] = useState<string>();
    useEffect(() => {
        if (versionToInstall == null && installOtherVersionDialog.isVisible) {
            setVersionToInstall(installOtherVersionDialog.app.latestVersion);
        }
    }, [versionToInstall, installOtherVersionDialog]);

    const appName = installOtherVersionDialog.isVisible
        ? installOtherVersionDialog.app.displayName
        : '';

    return (
        <ConfirmationDialog
            isVisible={installOtherVersionDialog.isVisible}
            title="Install other version"
            confirmLabel="Install"
            cancelLabel="Cancel"
            onConfirm={() => {
                if (!installOtherVersionDialog.isVisible) {
                    throw new Error(
                        'Should be impossible to invoke a disabled button'
                    );
                }

                dispatch(
                    installDownloadableApp(
                        installOtherVersionDialog.app,
                        versionToInstall
                    )
                );
                dispatch(hideInstallOtherVersionDialog());
                setVersionToInstall(undefined);
            }}
            onCancel={() => {
                dispatch(hideInstallOtherVersionDialog());
                setVersionToInstall(undefined);
            }}
        >
            <p>
                You can install an old version of “{appName}”, but please note
                that only running the latest version is supported by Nordic
                Semiconductor.
            </p>

            <p>
                Version to install:
                <VersionList
                    app={
                        installOtherVersionDialog.isVisible
                            ? installOtherVersionDialog.app
                            : undefined
                    }
                    versionToInstall={versionToInstall}
                    setVersionToInstall={setVersionToInstall}
                />
            </p>
        </ConfirmationDialog>
    );
};
