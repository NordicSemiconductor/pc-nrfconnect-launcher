/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { Iterable } from 'immutable';
import { useHotKey } from 'pc-nrfconnect-shared';
import { func, instanceOf } from 'prop-types';

import { setSetting } from '../../ipc/settings';
import {
    getNameFilter,
    getShownSources,
    getShownStates,
    hideSource,
    setNameFilter,
    setShownStates,
    showSource,
} from '../features/filter/filterSlice';
import { getAllSourceNamesSorted } from '../reducers/appsReducer';
import { useLauncherDispatch, useLauncherSelector } from '../util/hooks';

const SourceFilter = () => {
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
                        const show = target.checked;

                        setSetting('app-management.sources', {
                            ...Object.fromEntries(
                                allSourceNames.map(source => [
                                    source,
                                    shownSourceNames.has(source),
                                ])
                            ),
                            [sourceName]: show,
                        });

                        if (show) {
                            dispatch(showSource(sourceName));
                            // TODO: Implement showSourceInSettings(name);
                        } else {
                            dispatch(hideSource(sourceName));
                            // TODO: Implement hideSourceInSettings(name);
                        }
                    }}
                />
            ))}
        </Col>
    );
};

const StateFilter = () => {
    const dispatch = useLauncherDispatch();
    const { installed, available } = useLauncherSelector(getShownStates);

    return (
        <Col className="pr-4 pl-0">
            <div className="border-bottom py-1 mx-3 mb-2">State</div>
            <Form.Check
                label="Installed"
                id="cb-installed"
                className="mx-3 py-1 px-4"
                custom
                checked={installed}
                onChange={({ target }) => {
                    setSetting('app-management.show', {
                        available,
                        installed: target.checked,
                    });
                    dispatch(setShownStates({ installed: target.checked }));
                }}
            />
            <Form.Check
                label="Available"
                id="cb-available"
                className="mx-3 py-1 px-4"
                custom
                checked={available}
                onChange={({ target }) => {
                    setSetting('app-management.show', {
                        available: target.checked,
                        installed,
                    });
                    dispatch(setShownStates({ available: target.checked }));
                }}
            />
        </Col>
    );
};

const FilterDropdown = () => {
    const [active, toggleActive] = useState(false);

    return (
        <Dropdown onToggle={() => toggleActive(!active)}>
            <Dropdown.Toggle variant="outline-secondary" active={active}>
                <span className="mdi mdi-tune" />
                Filter
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Row className="flex-nowrap">
                    <SourceFilter />
                    <StateFilter />
                </Row>
            </Dropdown.Menu>
        </Dropdown>
    );
};

const NameFilter = () => {
    const dispatch = useLauncherDispatch();
    const filter = useLauncherSelector(getNameFilter);
    const searchFieldRef = useRef(null);

    useHotKey({
        hotKey: ['mod+e', 'mod+f', 'mod+l'],
        title: 'Focus search field',
        isGlobal: false,
        action: () => searchFieldRef.current.focus(),
    });

    return (
        <Form.Control
            type="text"
            placeholder="Search..."
            value={filter}
            ref={searchFieldRef}
            onChange={event => {
                const nameFilter = event.target.value;
                setSetting('app-management.filter', nameFilter);
                dispatch(setNameFilter(nameFilter));
            }}
        />
    );
};

const UpdateAllApps = ({ onUpgrade, upgradeableApps }) =>
    upgradeableApps.size > 0 && (
        <Button
            variant="outline-secondary"
            onClick={() =>
                upgradeableApps.forEach(({ name, latestVersion, source }) =>
                    onUpgrade(name, latestVersion, source)
                )
            }
            className="me_32px"
        >
            Update all apps
        </Button>
    );

UpdateAllApps.propTypes = {
    upgradeableApps: instanceOf(Iterable).isRequired,
    onUpgrade: func.isRequired,
};

const AppManagementFilter = ({ upgradeableApps, onUpgrade }) => (
    <div className="filterbox w-100 d-inline-flex">
        <FilterDropdown />
        <NameFilter />
        <div className="flex-fill" />
        <UpdateAllApps
            onUpgrade={onUpgrade}
            upgradeableApps={upgradeableApps}
        />
    </div>
);

AppManagementFilter.propTypes = {
    upgradeableApps: instanceOf(Iterable).isRequired,
    onUpgrade: func.isRequired,
};

export default AppManagementFilter;
