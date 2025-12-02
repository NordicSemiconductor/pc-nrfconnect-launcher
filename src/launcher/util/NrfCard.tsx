/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Card from 'react-bootstrap/Card';

const NrfCard: React.FC = ({ children }) => <Card body>{children}</Card>;

export default NrfCard;
