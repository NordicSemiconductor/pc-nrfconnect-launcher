/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { App } from '../../../../ipc/apps';
import appCompatibilityWarning from '../../../util/appCompatibilityWarning';

const warning = (altText: string) => (
    <div>
        <span className="alert-icon-bg" />
        <span className="mdi mdi-alert" title={altText} />
    </div>
);

const appBadge = (app: App) => {
    if (!app.isInstalled) {
        return null;
    }

    const compatibilityWarning = appCompatibilityWarning(app);

    return compatibilityWarning != null
        ? warning(compatibilityWarning.warning)
        : null;
};

const AppIcon: React.FC<{ app: App }> = ({ app }) => (
    <div className="core-app-icon">
        {app.iconPath ? (
            <img src={app.iconPath} alt="" draggable={false} />
        ) : (
            <div className="icon-replacement" />
        )}
        {appBadge(app)}
    </div>
);

export default AppIcon;
