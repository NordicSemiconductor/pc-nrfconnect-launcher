/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import spinnerImg from 'pc-nrfconnect-shared/src/Dialog/ajax-loader.gif';
import { number, string } from 'prop-types';

const Spinner = ({ size, className }) => (
    <img
        className={className}
        src={spinnerImg}
        height={size}
        width={size}
        alt="Loading..."
    />
);

Spinner.propTypes = {
    size: number,
    className: string,
};

Spinner.defaultProps = {
    size: 16,
    className: 'core-spinner',
};

export default Spinner;
