/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useRef } from 'react';
import { Iterable } from 'immutable';
import { bool, func, instanceOf, oneOfType, string } from 'prop-types';

import { decorate } from '../../decoration';
import LogHeaderContainer from '../containers/LogHeaderContainer';
import LogEntry from './LogEntry';

const DecoratedLogEntry = decorate(LogEntry, 'LogEntry');

const LogViewer = ({ logEntries, autoScroll, onMount, cssClass }) => {
    const logContainer = useRef(null);

    useEffect(() => {
        if (autoScroll && logContainer.current.lastChild) {
            logContainer.current.lastChild.scrollIntoView();
        }
    });
    useEffect(onMount, [onMount]);

    return (
        <div className={cssClass}>
            <LogHeaderContainer />
            <div ref={logContainer} className="core-infinite-log">
                {logEntries.map(entry => (
                    <DecoratedLogEntry {...{ entry }} key={entry.id} />
                ))}
            </div>
        </div>
    );
};

LogViewer.propTypes = {
    onMount: func,
    logEntries: oneOfType([instanceOf(Array), instanceOf(Iterable)]).isRequired,
    autoScroll: bool.isRequired,
    cssClass: string,
};

LogViewer.defaultProps = {
    onMount: null,
    cssClass: 'core-log-viewer',
};

export default LogViewer;
