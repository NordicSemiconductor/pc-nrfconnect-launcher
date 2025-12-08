/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import Col from './Col';
import Row from './Row';

const Card: React.FC<{ title: string; titleButton?: React.ReactNode }> = ({
    title,
    titleButton,
    children,
}) => (
    <div className="tw-mt-4 tw-border tw-border-solid tw-border-black/10 tw-bg-white tw-p-5 first:tw-mt-0">
        <Row>
            <Col>
                <h5 className="tw-mb-3 tw-font-normal">{title}</h5>
            </Col>
            {titleButton && <Col fixedSize>{titleButton}</Col>}
        </Row>

        {children}
    </div>
);

export default Card;
