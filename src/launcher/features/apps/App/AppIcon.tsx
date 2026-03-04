/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import path from 'path';

import { type App, isInstalled } from '../../../../ipc/apps';
import appCompatibilityWarning from '../../../util/appCompatibilityWarning';
import { useLauncherSelector } from '../../../util/hooks';
import { isJLinkFinishedInstalling } from '../../jlinkUpdate/jlinkUpdateSlice';
import { type DisplayedApp, isInProgress } from '../appsSlice';

const warning = (altText: string) => (
    <div>
        <span className="alert-icon-bg" />
        <span className="mdi mdi-alert" title={altText} />
    </div>
);

const appBadge = async (app: App) => {
    if (!isInstalled(app)) {
        return null;
    }

    const compatibilityWarning = await appCompatibilityWarning(app);

    return compatibilityWarning != null
        ? warning(compatibilityWarning.warning)
        : null;
};

const AppIcon: React.FC<{ app: DisplayedApp }> = ({ app }) => {
    const [badge, setBadge] =
        useState<Awaited<ReturnType<typeof appBadge>>>(null);
    const jlinkInstalled = useLauncherSelector(isJLinkFinishedInstalling);

    useEffect(() => {
        if (!isInProgress(app)) {
            appBadge(app).then(setBadge);
        }
        // Trigger this once more after JLink was successfully installed or updated
    }, [app, jlinkInstalled]);

    return (
        <div className="core-app-icon">
            {app.iconPath ? (
                <img
                    src={app.iconPath
                        .split(path.sep)
                        .map((val, index) =>
                            // Don't encode Windows `<drive>:`
                            process.platform === 'win32' && index === 0
                                ? val
                                : encodeURIComponent(val),
                        )
                        .join(path.sep)}
                    alt=""
                    draggable={false}
                />
            ) : (
                <div className="icon-replacement" />
            )}
            {badge}
        </div>
    );
};
export default AppIcon;
