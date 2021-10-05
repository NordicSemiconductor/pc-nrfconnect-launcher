/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';

import { decorate } from '../../decoration';
import LogHeaderButton from './LogHeaderButton';

const DecoratedLogHeaderButton = decorate(LogHeaderButton, 'LogHeaderButton');

const LogHeader = ({
    text,
    buttons,
    onButtonClicked,
    cssClass,
    headerTextCssClass,
    headerButtonsCssClass,
}) => (
    <div className={cssClass}>
        <div className={headerTextCssClass}>{text}</div>
        <div className={headerButtonsCssClass}>
            {buttons.map(button => (
                <DecoratedLogHeaderButton
                    key={button.id}
                    title={button.title}
                    iconCssClass={button.iconCssClass}
                    isSelected={button.isSelected}
                    onClick={() => onButtonClicked(button.id)}
                />
            ))}
        </div>
    </div>
);

LogHeader.propTypes = {
    text: string,
    buttons: arrayOf(
        shape({
            id: string,
            title: string,
            iconCssClass: string,
            isSelected: bool,
        })
    ),
    onButtonClicked: func.isRequired,
    cssClass: string,
    headerTextCssClass: string,
    headerButtonsCssClass: string,
};

LogHeader.defaultProps = {
    text: 'Log',
    buttons: [],
    cssClass: 'core-log-header',
    headerTextCssClass: 'core-log-header-text',
    headerButtonsCssClass: 'core-padded-row core-log-header-buttons',
};

export default LogHeader;
