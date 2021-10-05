/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const LEGACY_APP_DIALOG_SHOW_MAYBE = 'LEGACY_APP_DIALOG_SHOW_MAYBE';
export const showMaybeLegacyAppDialog = () => ({
    type: LEGACY_APP_DIALOG_SHOW_MAYBE,
});

export const LEGACY_APP_DIALOG_HIDE = 'LEGACY_APP_DIALOG_HIDE';
export const hideLegacyAppDialog = () => ({ type: LEGACY_APP_DIALOG_HIDE });

export type LegacyAppAction =
    | ReturnType<typeof showMaybeLegacyAppDialog>
    | ReturnType<typeof hideLegacyAppDialog>;
