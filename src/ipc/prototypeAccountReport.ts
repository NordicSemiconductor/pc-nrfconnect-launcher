/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    on,
    send,
} from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/infrastructure/mainToRenderer';
import { z } from 'zod';

export const notificationsSchema = z.array(
    z.object({
        notificationId: z.string(),
        notificationName: z.string(),
        criticality: z.enum(['Low', 'Medium', 'High']),
    }),
);

export type Notifications = z.infer<typeof notificationsSchema>;

const channel = {
    reportNotifications: 'prototype-account-report:notifications',
};

// Report notifications
type ReportNotifications = (notifications: Notifications) => void;

const reportNotifications = send<ReportNotifications>(
    channel.reportNotifications,
);
const registerReportNotifications = on<ReportNotifications>(
    channel.reportNotifications,
);

export const forMain = {
    registerReportNotifications,
};
export const inRenderer = {
    reportNotifications,
};
