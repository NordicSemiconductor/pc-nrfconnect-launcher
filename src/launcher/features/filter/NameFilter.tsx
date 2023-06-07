/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useRef } from 'react';
import Form from 'react-bootstrap/Form';
import { useHotKey } from 'pc-nrfconnect-shared';

import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { getNameFilter, setNameFilter } from './filterSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const filter = useLauncherSelector(getNameFilter);
    const searchFieldRef = useRef<HTMLInputElement>(null);

    useHotKey({
        hotKey: ['mod+e', 'mod+f', 'mod+l'],
        title: 'Focus search field',
        isGlobal: false,
        action: () => {
            searchFieldRef.current?.focus();
            searchFieldRef.current?.select();
        },
    });

    return (
        <Form.Control
            type="text"
            placeholder="Search..."
            value={filter}
            ref={searchFieldRef}
            onChange={event => {
                const nameFilter = event.target.value;
                dispatch(setNameFilter(nameFilter));
            }}
            onClick={() => searchFieldRef.current?.select()}
        />
    );
};
