/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { useLauncherSelector } from '../../util/hooks';
import Col from '../layout/Col';
import { getNotifications } from './notificationsSlice';

const color = (criticality: 'Low' | 'Medium' | 'High') => {
    switch (criticality) {
        case 'Low':
            return 'tw-bg-green';
        case 'Medium':
            return 'tw-bg-orange';
        case 'High':
            return 'tw-bg-red';
    }
};

export default () => {
    const notifications = useLauncherSelector(getNotifications);

    if (notifications.length === 0) return null;

    return (
        <>
            {notifications.map(notification => (
                <Col
                    key={notification.notificationId}
                    className={`tw-mb-4 tw-rounded tw-p-4 ${color(notification.criticality)}`}
                >
                    {notification.notificationName}
                </Col>
            ))}
        </>
    );
};
