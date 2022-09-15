/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from '..';

export const useLauncherDispatch: () => AppDispatch = useDispatch;
export const useLauncherSelector: TypedUseSelectorHook<RootState> = useSelector;
