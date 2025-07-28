/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { getAllSourceNamesSorted } from '../sources/sourcesSlice';
import { getHiddenSources, hideSource, showSource } from './filterSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const allSourceNames = useLauncherSelector(getAllSourceNamesSorted);
    const hiddenSources = useLauncherSelector(getHiddenSources);

    return (
        <Col className="pl-4 pr-0">
            <div className="border-bottom mx-3 mb-2 py-1">Sources</div>
            {allSourceNames.map((sourceName, i) => {
                const isShown = !hiddenSources.has(sourceName);

                return (
                    <Form.Check
                        label={sourceName}
                        id={`cb-${sourceName}`}
                        key={`cb-${i + 1}`}
                        className="text-capitalize mx-3 px-4 py-1"
                        custom
                        checked={isShown}
                        onChange={() => {
                            if (isShown) {
                                dispatch(hideSource(sourceName));
                            } else {
                                dispatch(showSource(sourceName));
                            }
                        }}
                    />
                );
            })}
        </Col>
    );
};
