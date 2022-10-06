/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Row from 'react-bootstrap/Row';

import NameFilter from './NameFilter';
import SourceFilter from './SourceFilter';
import StateFilter from './StateFilter';
import UpdateAllApps from './UpdateAllApps';

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

export default () => (
    <div className="filterbox w-100 d-inline-flex">
        <FilterDropdown />
        <NameFilter />
        <div className="flex-fill" />
        <UpdateAllApps />
    </div>
);
