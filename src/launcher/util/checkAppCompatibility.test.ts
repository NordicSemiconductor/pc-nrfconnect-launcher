/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { inspect } from 'util';

import checkAppCompatibility, {
    checkEngineIsSupported,
    checkEngineVersionIsSet,
} from './checkAppCompatibility';

const requiringEngine = (engineVersion?: string) => ({
    engineVersion,
});

const failingCheck = {
    isDecided: true,
    isCompatible: false,
    warning: expect.anything(),
    longWarning: expect.anything(),
};

const successfulCheck = {
    isDecided: true,
    isCompatible: true,
};

const undecidedCheck = {
    isDecided: false,
};

describe('check compatibility of an app with the launcher', () => {
    describe('check if the app sets an engine version', () => {
        it('fails without an engine version', () => {
            expect(
                checkEngineVersionIsSet(
                    requiringEngine(undefined),
                    'irrelevant'
                )
            ).toMatchObject(failingCheck);
        });

        it('is undefined if any engine version is set', () => {
            expect(
                checkEngineVersionIsSet(requiringEngine('^1.0.0'), 'irrelevant')
            ).toMatchObject(undecidedCheck);
        });
    });

    describe('check if the engine version is what the app requires', () => {
        it('is undefined if the app requires a lower version', () => {
            expect(
                checkEngineIsSupported(requiringEngine('^1.0.0'), '1.2.3')
            ).toMatchObject(undecidedCheck);
        });

        it('is undefined if the app requires the same version', () => {
            expect(
                checkEngineIsSupported(requiringEngine('^1.2.3'), '1.2.3')
            ).toMatchObject(undecidedCheck);
        });

        it('is undefined if the engine is just a pre-release', () => {
            expect(
                checkEngineIsSupported(
                    requiringEngine('^1.2.3'),
                    '1.2.3-alpha.0'
                )
            ).toMatchObject(undecidedCheck);
        });

        it('fails if the app requires a higher version', () => {
            expect(
                checkEngineIsSupported(requiringEngine('^2.0.0'), '1.2.3')
            ).toMatchObject(failingCheck);
        });
    });

    describe('integrating all the checkes', () => {
        describe('some checks fails if', () => {
            [
                {
                    description: 'the app fails to specify engine version',
                    app: [undefined],
                    engine: ['1.0.0'],
                },
                {
                    description: 'the app requires a higher engine version',
                    app: ['^1.0.1'],
                    engine: ['1.0.0'],
                },
            ].forEach(
                ({
                    description,
                    app: [engineVersion],
                    engine: [providedVersionOfEngine],
                }) => {
                    const appSpec = { engineVersion };
                    const engineSpec = providedVersionOfEngine;

                    it(`${description}, with app spec ${inspect(
                        appSpec
                    )} and engine spec ${inspect(engineSpec)}`, () => {
                        expect(
                            checkAppCompatibility(
                                appSpec,
                                providedVersionOfEngine
                            )
                        ).toMatchObject(failingCheck);
                    });
                }
            );
        });

        describe('all checks are successful if', () => {
            [
                {
                    description: 'all versions are exactly as specified',
                    app: ['^1.0.0'],
                    engine: ['1.0.0'],
                },
                {
                    description: 'the provided versions are higher as required',
                    app: ['^1.0.0'],
                    engine: ['1.0.1'],
                },
            ].forEach(
                ({
                    description,
                    app: [engineVersion],
                    engine: [providedVersionOfEngine],
                }) => {
                    const appSpec = { engineVersion };
                    const engineSpec = providedVersionOfEngine;
                    it(`${description}, with app spec ${inspect(
                        appSpec
                    )} and engine spec ${inspect(engineSpec)}`, () => {
                        expect(
                            checkAppCompatibility(
                                appSpec,
                                providedVersionOfEngine
                            )
                        ).toMatchObject(successfulCheck);
                    });
                }
            );
        });
    });
});
