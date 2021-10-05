/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { classNames } from 'pc-nrfconnect-shared';
import { shape, string } from 'prop-types';
import semver from 'semver';

import checkAppCompatibility from '../util/checkAppCompatibility';

const warning = altText => (
    <div>
        <span className="alert-icon-bg" />
        <span className="mdi mdi-alert" title={altText} />
    </div>
);

const appBadge = app => {
    const notInstalled = !app.currentVersion;
    const appCompatibility = checkAppCompatibility(app);

    return notInstalled || appCompatibility.isCompatible
        ? null
        : warning(appCompatibility.warning);
};

const AppIcon = ({ app }) => {
    const { engineVersion, iconPath } = app;
    const primaryColorNeedsUpdate =
        engineVersion && semver.lt(semver.minVersion(engineVersion), '3.2.0');
    return (
        <div
            className={classNames(
                'core-app-icon',
                primaryColorNeedsUpdate && 'old-app-icon'
            )}
        >
            {iconPath ? (
                <img src={iconPath} alt="" draggable={false} />
            ) : (
                <div className="icon-replacement" />
            )}
            {appBadge(app)}
        </div>
    );
};

AppIcon.propTypes = {
    app: shape({
        iconPath: string,
        currentVersion: string,
        engineVersion: string,
    }).isRequired,
};

export default AppIcon;
