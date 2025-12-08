/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import Col from '../layout/Col';
import CheckboxFilterEntry from './CheckboxFilterEntry';
import FilterDropdownHeading from './FilterDropdownHeading';
import { getShownStates, setShownStates } from './filterSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const { installed, downloadable } = useLauncherSelector(getShownStates);

    return (
        <Col className="tw-pl-0 tw-pr-6">
            <FilterDropdownHeading label="State" />
            <CheckboxFilterEntry
                label="Installed"
                checked={installed}
                onChange={({ target }) => {
                    dispatch(
                        setShownStates({
                            installed: target.checked,
                            downloadable,
                        }),
                    );
                }}
            />
            <CheckboxFilterEntry
                label="Downloadable"
                checked={downloadable}
                onChange={({ target }) => {
                    dispatch(
                        setShownStates({
                            installed,
                            downloadable: target.checked,
                        }),
                    );
                }}
            />
        </Col>
    );
};
