/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { bool, func, string } from 'prop-types';

const LogHeaderButton = ({
    title,
    cssClass,
    iconCssClass,
    selectedCssClass,
    isSelected,
    onClick,
}) => (
    <button
        title={title}
        className={`${cssClass} ${isSelected ? selectedCssClass : ''}`}
        onClick={onClick}
        type="button"
    >
        <span className={iconCssClass} aria-hidden="true" />
    </button>
);

LogHeaderButton.propTypes = {
    title: string.isRequired,
    onClick: func.isRequired,
    iconCssClass: string.isRequired,
    isSelected: bool,
    cssClass: string,
    selectedCssClass: string,
};

LogHeaderButton.defaultProps = {
    isSelected: false,
    cssClass: 'btn btn-primary btn-sm core-btn',
    selectedCssClass: 'active',
};

export default LogHeaderButton;
