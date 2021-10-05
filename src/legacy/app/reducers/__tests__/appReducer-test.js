/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { clearDecorationCache, setApp } from '../../../decoration';
import reducer from '../appReducer';

beforeEach(clearDecorationCache);

describe('appReducer', () => {
    it('should have empty object as initial state if reducer has not been decorated', () => {
        setApp({});
        const initialState = reducer(undefined, {});

        expect(initialState).toEqual({});
    });

    it('should use initial state from app if reducer has been decorated', () => {
        setApp({
            reduceApp: (state = { foo: 'bar' }) => ({
                ...state,
            }),
        });
        const initialState = reducer(undefined, {});

        expect(initialState).toEqual({ foo: 'bar' });
    });
});
