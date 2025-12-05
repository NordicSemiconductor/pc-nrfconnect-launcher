/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Col from 'react-bootstrap/Col';
import { capitalize } from 'lodash';

import { allStandardSourceNames } from '../../../common/sources';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { getExternalSourcesSorted } from '../sources/sourcesSlice';
import CheckboxFilterEntry from './CheckboxFilterEntry';
import { getHiddenSources, hideSource, showSource } from './filterSlice';

export default () => {
    const dispatch = useLauncherDispatch();

    const externalSourceNames = useLauncherSelector(
        getExternalSourcesSorted,
    ).map(({ name }) => name);
    const allSourceNames = [...allStandardSourceNames, ...externalSourceNames];

    const hiddenSources = useLauncherSelector(getHiddenSources);

    return (
        <Col className="pl-4 pr-0">
            <div className="border-bottom mx-3 mb-2 py-1">Sources</div>
            {allSourceNames.map((sourceName, i) => {
                const isShown = !hiddenSources.has(sourceName);

                return (
                    <CheckboxFilterEntry
                        label={
                            allStandardSourceNames.includes(sourceName)
                                ? capitalize(sourceName)
                                : sourceName
                        }
                        key={`cb-${i + 1}`}
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
