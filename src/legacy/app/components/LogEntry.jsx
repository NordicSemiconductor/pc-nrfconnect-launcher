/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React from 'react';
import PropTypes from 'prop-types';
import formatDate from 'date-fns/format';
import { shell } from 'electron';

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
    entry: PropTypes.shape({
        id: PropTypes.number.isRequired,
        timestamp: PropTypes.string.isRequired,
        level: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
    }).isRequired,
};

export default LogEntry;
