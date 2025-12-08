/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import BootstrapCard from 'react-bootstrap/Card';

import Col from './Col';
import Row from './Row';

const Card: React.FC<{ title: string; titleButton?: React.ReactNode }> = ({
    title,
    titleButton,
    children,
}) => (
    <BootstrapCard body className="tw-mt-4 first:tw-mt-0">
        <Row>
            <Col>
                <BootstrapCard.Title>{title}</BootstrapCard.Title>
            </Col>
            {titleButton && <Col fixedSize>{titleButton}</Col>}
        </Row>

        {children}
    </BootstrapCard>
);

export default Card;
