/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { Iterable } from 'immutable';
import { bool, func, instanceOf, shape, string } from 'prop-types';

export const sortedSources = sources => {
    const all = Object.entries(sources);
    const officialsAndLocal = [
        ...all.filter(([name]) => name === 'official'),
        ...all.filter(([name]) => name === 'local'),
    ];
    const rest = all
        .filter(source => !officialsAndLocal.includes(source))
        .sort((a, b) => a[0].localeCompare(b[0]));

    return [...officialsAndLocal, ...rest];
};

const SourceFilter = ({ sources, setAppManagementSource }) => (
    <Col className="pl-4 pr-0">
        <div className="border-bottom py-1 mx-3 mb-2">Sources</div>
        {sortedSources(sources).map(([name, checked], i) => (
            <Form.Check
                label={name}
                id={`cb-${name}`}
                key={`cb-${i + 1}`}
                className="mx-3 py-1 px-4 text-capitalize"
                custom
                checked={checked}
                onChange={({ target }) =>
                    setAppManagementSource(name, target.checked)
                }
            />
        ))}
    </Col>
);
SourceFilter.propTypes = {
    sources: instanceOf(Object).isRequired,
    setAppManagementSource: func.isRequired,
};

const StateFilter = ({
    show: { installed, available },
    setAppManagementShow,
}) => (
    <Col className="pr-4 pl-0">
        <div className="border-bottom py-1 mx-3 mb-2">State</div>
        <Form.Check
            label="Installed"
            id="cb-installed"
            className="mx-3 py-1 px-4"
            custom
            checked={installed}
            onChange={({ target }) =>
                setAppManagementShow({
                    installed: target.checked,
                })
            }
        />
        <Form.Check
            label="Available"
            id="cb-available"
            className="mx-3 py-1 px-4"
            custom
            checked={available}
            onChange={({ target }) =>
                setAppManagementShow({
                    available: target.checked,
                })
            }
        />
    </Col>
);
StateFilter.propTypes = {
    show: shape({
        installed: bool,
        available: bool,
    }).isRequired,
    setAppManagementShow: func.isRequired,
};

const FilterDropdown = ({
    sources,
    show,
    setAppManagementShow,
    setAppManagementSource,
}) => (
    <Dropdown>
        <Dropdown.Toggle variant="outline-secondary">
            <span className="mdi mdi-tune" />
            Filter
        </Dropdown.Toggle>

        <Dropdown.Menu>
            <Row className="flex-nowrap">
                <SourceFilter
                    sources={sources}
                    setAppManagementSource={setAppManagementSource}
                />
                <StateFilter
                    show={show}
                    setAppManagementShow={setAppManagementShow}
                />
            </Row>
        </Dropdown.Menu>
    </Dropdown>
);
FilterDropdown.propTypes = {
    sources: instanceOf(Object).isRequired,
    show: shape({
        installed: bool,
        available: bool,
    }).isRequired,
    setAppManagementShow: func.isRequired,
    setAppManagementSource: func.isRequired,
};

const AppManagementFilter = ({
    upgradeableApps,
    sources,
    show,
    filter,
    onUpgrade,
    setAppManagementShow,
    setAppManagementFilter,
    setAppManagementSource,
}) => (
    <div className="filterbox mb-3 w-100 d-inline-flex">
        <FilterDropdown
            sources={sources}
            show={show}
            setAppManagementShow={setAppManagementShow}
            setAppManagementSource={setAppManagementSource}
        />
        <Form.Control
            type="text"
            placeholder="Search..."
            value={filter}
            onChange={({ target }) => setAppManagementFilter(target.value)}
        />
        <div className="flex-fill" />
        {upgradeableApps.size > 0 && (
            <Button
                variant="outline-secondary"
                onClick={() =>
                    upgradeableApps.forEach(({ name, latestVersion, source }) =>
                        onUpgrade(name, latestVersion, source)
                    )
                }
            >
                Update all apps
            </Button>
        )}
    </div>
);

AppManagementFilter.propTypes = {
    upgradeableApps: instanceOf(Iterable).isRequired,
    sources: instanceOf(Object).isRequired,
    onUpgrade: func.isRequired,
    show: shape({
        installed: bool,
        available: bool,
    }).isRequired,
    filter: string.isRequired,
    setAppManagementShow: func.isRequired,
    setAppManagementFilter: func.isRequired,
    setAppManagementSource: func.isRequired,
};

export default AppManagementFilter;
