/* Copyright (c) 2015 - 2019, Nordic Semiconductor ASA
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
import { Iterable } from 'immutable';

import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

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
    sources: PropTypes.instanceOf(Object).isRequired,
    setAppManagementSource: PropTypes.func.isRequired,
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
    show: PropTypes.shape({
        installed: PropTypes.bool,
        available: PropTypes.bool,
    }).isRequired,
    setAppManagementShow: PropTypes.func.isRequired,
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
    sources: PropTypes.instanceOf(Object).isRequired,
    show: PropTypes.shape({
        installed: PropTypes.bool,
        available: PropTypes.bool,
    }).isRequired,
    setAppManagementShow: PropTypes.func.isRequired,
    setAppManagementSource: PropTypes.func.isRequired,
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
    upgradeableApps: PropTypes.instanceOf(Iterable).isRequired,
    sources: PropTypes.instanceOf(Object).isRequired,
    onUpgrade: PropTypes.func.isRequired,
    show: PropTypes.shape({
        installed: PropTypes.bool,
        available: PropTypes.bool,
    }).isRequired,
    filter: PropTypes.string.isRequired,
    setAppManagementShow: PropTypes.func.isRequired,
    setAppManagementFilter: PropTypes.func.isRequired,
    setAppManagementSource: PropTypes.func.isRequired,
};

export default AppManagementFilter;
