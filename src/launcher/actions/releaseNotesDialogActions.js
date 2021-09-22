/*
 * Copyright (c) 2019 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const HIDE_RELEASE_NOTES = 'HIDE_RELEASE_NOTES';
export const SHOW_RELEASE_NOTES = 'SHOW_RELEASE_NOTES';

export const hide = () => ({ type: HIDE_RELEASE_NOTES });

export const show = ({ source, name }) => ({
    type: SHOW_RELEASE_NOTES,
    source,
    name,
});
