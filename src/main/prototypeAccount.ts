/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { net } from 'electron';
import { z } from 'zod';

import type { PrototypeAccountInformation } from '../ipc/prototypeAccount';
import { inRenderer, notificationsSchema } from '../ipc/prototypeAccountReport';

const dashboardSchema = z.object({
    success: z.literal(true),
    error: z.null(),
    data: notificationsSchema,
});

const fetchNotifications = async (accessToken: string) => {
    const { CENS_DASHBOARD_URL } = process.env;
    if (!CENS_DASHBOARD_URL)
        throw new Error('Env variable CENS_DASHBOARD_URL ust be set');

    const response = await net.fetch(CENS_DASHBOARD_URL, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    const notifications = dashboardSchema.parse(await response.json());

    console.log('Prototype notifications:', notifications.data);

    inRenderer.reportNotifications(notifications.data);
};

export const logIn = (): Promise<PrototypeAccountInformation> => {
    const {
        CENS_LOGIN_URL,
        CENS_GRANT_TYPE,
        CENS_CLIENT_ID,
        CENS_CLIENT_SECRET,
        CENS_SCOPE,
        CENS_USERNAME,
        CENS_PASSWORD,
    } = process.env;

    if (
        !CENS_LOGIN_URL ||
        !CENS_GRANT_TYPE ||
        !CENS_CLIENT_ID ||
        !CENS_CLIENT_SECRET ||
        !CENS_SCOPE ||
        !CENS_USERNAME ||
        !CENS_PASSWORD
    ) {
        throw new Error('Env variable must be set');
    }

    const request = net.request({
        url:
            `${CENS_LOGIN_URL}` +
            `?grant_type=${encodeURIComponent(CENS_GRANT_TYPE)}` +
            `&client_id=${encodeURIComponent(CENS_CLIENT_ID)}` +
            `&client_secret=${encodeURIComponent(CENS_CLIENT_SECRET)}` +
            `&scope=${encodeURIComponent(CENS_SCOPE)}` +
            `&username=${encodeURIComponent(CENS_USERNAME)}` +
            `&password=${encodeURIComponent(CENS_PASSWORD)}`,
        method: 'GET',
        // headers: { contentType: 'application/x-www-form-urlencoded' },
    });
    request.end(
        `grant_type=${encodeURIComponent(CENS_GRANT_TYPE)}` +
            `&client_id=${encodeURIComponent(CENS_CLIENT_ID)}` +
            `&client_secret=${encodeURIComponent(CENS_CLIENT_SECRET)}` +
            `&scope=${encodeURIComponent(CENS_SCOPE)}` +
            `&username=${encodeURIComponent(CENS_USERNAME)}` +
            `&password=${encodeURIComponent(CENS_PASSWORD)}`,
    );

    return new Promise<PrototypeAccountInformation>((resolve, reject) => {
        request.on('response', response => {
            if (response.statusCode >= 400) {
                reject(
                    new Error(
                        `Failed to log in to CENS. Status code: ${response.statusCode}`,
                    ),
                );
            }
            response.on('data', chunk => {
                // console.log('XXX start');
                // console.log(chunk);
                // console.log(JSON.parse(chunk.toString()).access_token);
                // console.log(
                //     JSON.parse(
                //         atob(
                //             JSON.parse(chunk.toString()).access_token.split(
                //                 '.',
                //             )[1],
                //         ),
                //     ),
                // );

                const responseSchema = z.object({
                    access_token: z.string(),
                });
                const accessToken = responseSchema.parse(
                    JSON.parse(chunk.toString()),
                ).access_token;

                const accessTokenSchema = z.object({
                    exp: z.number(),
                    name: z.string(),
                });
                const { exp, name } = accessTokenSchema.parse(
                    JSON.parse(atob(accessToken.split('.')[1])),
                );

                console.log(accessToken);

                // storeToken(token);

                resolve({ expires: new Date(exp * 1000), name });

                fetchNotifications(accessToken);
            });

            // response.on('end', () => {
            //     console.log('No more data in response.');
            // });
        });
    });
};
