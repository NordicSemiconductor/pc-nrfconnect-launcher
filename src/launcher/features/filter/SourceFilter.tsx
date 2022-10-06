/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

import {
    hideSource as hideSourceInSettings,
    showSource as showSourceInSettings,
} from '../../../ipc/settings';
import { getAllSourceNamesSorted } from '../../reducers/appsReducer';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { getShownSources, hideSource, showSource } from './filterSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const allSourceNames = useLauncherSelector(getAllSourceNamesSorted);
    const shownSourceNames = useLauncherSelector(getShownSources);

    return (
        <Col className="pl-4 pr-0">
            <div className="border-bottom py-1 mx-3 mb-2">Sources</div>
            {allSourceNames.map((sourceName, i) => (
                <Form.Check
                    label={sourceName}
                    id={`cb-${sourceName}`}
                    key={`cb-${i + 1}`}
                    className="mx-3 py-1 px-4 text-capitalize"
                    custom
                    checked={shownSourceNames.has(sourceName)}
                    onChange={({ target }) => {
                        if (target.checked) {
                            dispatch(showSource(sourceName));
                            showSourceInSettings(sourceName);
                        } else {
                            dispatch(hideSource(sourceName));
                            hideSourceInSettings(sourceName);
                        }
                    }}
                />
            ))}
        </Col>
    );
};
