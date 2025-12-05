/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Card from 'react-bootstrap/Card';

import Col from './Col';
import Row from './Row';

const NrfCard: React.FC<{ title: string; titleButton?: React.ReactNode }> = ({
    title,
    titleButton,
    children,
}) => (
    <Card body className="tw-mt-4 first:tw-mt-0">
        <Row>
            <Col>
                <Card.Title>{title}</Card.Title>
            </Col>
            {titleButton && <Col fixedSize>{titleButton}</Col>}
        </Row>

        {children}
    </Card>
);

export default NrfCard;
