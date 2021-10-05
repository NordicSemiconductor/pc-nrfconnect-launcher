/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { openUrl } from 'pc-nrfconnect-shared';
import logo from 'pc-nrfconnect-shared/src/Logo/nordic-logo-white-icon-only.png';
import { func, string } from 'prop-types';

const Logo = ({ src, alt, cssClass, containerCssClass, onClick }) => (
    <div
        className={containerCssClass}
        role="link"
        onClick={onClick}
        onKeyPress={() => {}}
        tabIndex="0"
    >
        <img className={cssClass} src={src} alt={alt} />
    </div>
);

Logo.propTypes = {
    src: string,
    alt: string,
    cssClass: string,
    containerCssClass: string,
    onClick: func,
};

Logo.defaultProps = {
    src: logo,
    alt: 'nRF Connect',
    cssClass: 'core-logo',
    containerCssClass: 'core-logo-container',
    onClick: () => openUrl('http://www.nordicsemi.com/nRFConnect'),
};

export default Logo;
