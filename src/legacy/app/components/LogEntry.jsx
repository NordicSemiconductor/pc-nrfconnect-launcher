/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import formatDate from 'date-fns/format';
import { shell } from 'electron';
import { number, shape, string } from 'prop-types';

const regex = /(.*?)(https?:\/\/[^\s]+)/g;

/**
 * Convert strings to array of strings and JSX <a> tags for hrefs
 *
 * E.g. 'For reference see: https://github.com/example/doc.md or reboot Windows.'
 * will be converted to:
 * [
 *    'For reference see: ',
 *    <a href='https://github.com/example/doc.md'>https://github.com/example/doc.md</a>,
 *    ' or reboot Windows.',
 * ]
 *
 * @param {string} str input string
 * @returns {Array} strings and JSX <a> tags
 */
function hrefReplacer(str) {
    const errorMessage = typeof str === 'object' ? str.message || '' : str;
    const message = [];
    const remainder = errorMessage.replace(
        regex,
        (match, before, href, index) => {
            message.push(before);
            message.push(
                <a
                    href={href}
                    key={index}
                    tabIndex={index}
                    onClick={() => shell.openItem(href)}
                    onKeyPress={() => {}}
                >
                    {href}
                </a>
            );
            return '';
        }
    );
    message.push(remainder);
    return message;
}

const LogEntry = ({ entry }) => {
    const className = `core-log-entry core-log-level-${entry.level}`;
    const time = formatDate(new Date(entry.timestamp), 'HH:mm:ss.SSS');

    return (
        <div className={className}>
            <div className="core-log-time">{time}</div>
            <div className="core-log-message">
                {hrefReplacer(entry.message)}
            </div>
        </div>
    );
};

LogEntry.propTypes = {
    entry: shape({
        id: number.isRequired,
        timestamp: string.isRequired,
        level: string.isRequired,
        message: string.isRequired,
    }).isRequired,
};

export default LogEntry;
