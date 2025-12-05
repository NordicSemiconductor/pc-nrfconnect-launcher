/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { clipboard } from 'electron';

import { useLauncherDispatch, useLauncherSelector } from '../../../util/hooks';
import NrfCard from '../../layout/NrfCard';
import {
    getExternalSourcesSorted,
    showAddSource,
    showRemoveSource,
} from '../../sources/sourcesSlice';

export default () => {
    const dispatch = useLauncherDispatch();

    const sources = useLauncherSelector(getExternalSourcesSorted);

    const addSource = (
        <Button
            variant="outline-primary"
            onClick={() => dispatch(showAddSource())}
        >
            Add source
        </Button>
    );

    return (
        <NrfCard title="App sources" titleButton={addSource}>
            {sources.map(source => (
                <Row key={source.name} className="tw-mt-4">
                    <Col className="tw-text-md tw-font-medium">
                        {source.name}
                    </Col>
                    <Col xs="auto">
                        <ButtonToolbar>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => clipboard.writeText(source.url)}
                                title="Copy URL to clipboard"
                            >
                                Copy URL
                            </Button>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() =>
                                    dispatch(showRemoveSource(source.name))
                                }
                                title="Remove source and associated apps"
                            >
                                Remove
                            </Button>
                        </ButtonToolbar>
                    </Col>
                </Row>
            ))}
        </NrfCard>
    );
};
