/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { inspect } from 'util';

import checkAppCompatibility, {
    checkEngineIsSupported,
    checkEngineVersionIsSet,
    checkIdenticalShared,
    checkProvidedVersionOfSharedIsValid,
    checkRequestedSharedIsProvided,
    checkRequestedVersionOfSharedIsValid,
} from './checkAppCompatibility';

const providingEngine = (providedVersionOfEngine: string) => ({
    providedVersionOfEngine,
    providedVersionOfShared: 'irrelevant',
});

const requiringEngine = (engineVersion?: string) => ({
    engineVersion,
});

const providingShared = (providedVersionOfShared: string) => ({
    providedVersionOfEngine: 'irrelevant',
    providedVersionOfShared,
});

const requiringShared = (sharedVersion?: string) => ({
    engineVersion: 'irrelevant',
    sharedVersion,
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
                    providingEngine('irrelevant')
                )
            ).toMatchObject(failingCheck);
        });

        it('is undefined if any engine version is set', () => {
            expect(
                checkEngineVersionIsSet(
                    requiringEngine('^1.0.0'),
                    providingEngine('irrelevant')
                )
            ).toMatchObject(undecidedCheck);
        });
    });

    describe('check if the engine version is what the app requires', () => {
        it('is undefined if the app requires a lower version', () => {
            expect(
                checkEngineIsSupported(
                    requiringEngine('^1.0.0'),
                    providingEngine('1.2.3')
                )
            ).toMatchObject(undecidedCheck);
        });

        it('is undefined if the app requires the same version', () => {
            expect(
                checkEngineIsSupported(
                    requiringEngine('^1.2.3'),
                    providingEngine('1.2.3')
                )
            ).toMatchObject(undecidedCheck);
        });

        it('is undefined if the engine is just a pre-release', () => {
            expect(
                checkEngineIsSupported(
                    requiringEngine('^1.2.3'),
                    providingEngine('1.2.3-alpha.0')
                )
            ).toMatchObject(undecidedCheck);
        });

        it('fails if the app requires a higher version', () => {
            expect(
                checkEngineIsSupported(
                    requiringEngine('^2.0.0'),
                    providingEngine('1.2.3')
                )
            ).toMatchObject(failingCheck);
        });
    });

    describe('check if the shared versions are identical', () => {
        describe('succeeds if both are identical non-version numbers', () => {
            const fixedVersionStrings = [
                'test/branch',
                'ec5bfa74',
                'file:../pc-nrfconnect-shared/pc-nrfconnect-shared-4.20.0.tgz',
                'github:NordicSemiconductor/pc-nrfconnect-shared', // Happens when depending on the master branch of shared
            ];

            fixedVersionStrings.forEach(versionString =>
                it(`for ${versionString}`, () =>
                    expect(
                        checkIdenticalShared(
                            requiringShared(versionString),
                            providingShared(versionString)
                        )
                    ).toMatchObject(successfulCheck))
            );
        });

        it('is undefined if shared versions are different', () => {
            expect(
                checkIdenticalShared(
                    requiringShared('test/branch'),
                    providingShared('ec5bfa74149d19b233e446a23b8f09b7f8dde4d8')
                )
            ).toMatchObject(undecidedCheck);
        });
    });

    describe('check if the provided version of shared is a testable string', () => {
        it('is undefined if the app does not depend on shared', () => {
            expect(
                checkProvidedVersionOfSharedIsValid(
                    requiringShared(),
                    providingShared('test/branch')
                )
            ).toMatchObject(undecidedCheck);
        });

        it('is undefined if engine provides a normal version of shared', () => {
            expect(
                checkProvidedVersionOfSharedIsValid(
                    requiringShared('2.0.0'),
                    providingShared('1.2.3')
                )
            ).toMatchObject(undecidedCheck);
        });

        it('fails if the engine depends on a non numeric version of shared', () => {
            expect(
                checkProvidedVersionOfSharedIsValid(
                    requiringShared('2.0.0'),
                    providingShared('test/branch')
                )
            ).toMatchObject(failingCheck);
        });
    });

    describe('check if the required version of shared is a testable string', () => {
        it('is undefined if the app does not depend on shared', () => {
            expect(
                checkRequestedVersionOfSharedIsValid(
                    requiringShared(),
                    providingShared('irrelevant')
                )
            ).toMatchObject(undecidedCheck);
        });

        it('is undefined if the app depends on a normal version of shared', () => {
            expect(
                checkRequestedVersionOfSharedIsValid(
                    requiringShared('2.0.0'),
                    providingShared('irrelevant')
                )
            ).toMatchObject(undecidedCheck);
        });

        it('fails if the app depends on a non numeric version of shared', () => {
            expect(
                checkRequestedVersionOfSharedIsValid(
                    requiringShared('test/branch'),
                    providingShared('irrelevant')
                )
            ).toMatchObject(failingCheck);
        });
    });

    describe('check if the provided and required version of shared match', () => {
        it('is undefined if the app does not depend on shared', () => {
            expect(
                checkRequestedSharedIsProvided(
                    requiringShared(),
                    providingShared('3.0.0')
                )
            ).toMatchObject(undecidedCheck);
        });

        it('is undefined if the app depends on a lower version of shared', () => {
            expect(
                checkRequestedSharedIsProvided(
                    requiringShared('2.0.0'),
                    providingShared('3.0.0')
                )
            ).toMatchObject(undecidedCheck);
        });

        it('fails if the app depends on a higher version of shared', () => {
            expect(
                checkRequestedSharedIsProvided(
                    requiringShared('2.0.1'),
                    providingShared('2.0.0')
                )
            ).toMatchObject(failingCheck);
        });
    });

    describe('integrating all the checkes', () => {
        describe('some checks fails if', () => {
            [
                {
                    description: 'the app fails to specify engine version',
                    app: [undefined, '1.0.0'],
                    engine: ['1.0.0', '1.0.0'],
                },
                {
                    description: 'the app requires a higher engine version',
                    app: ['^1.0.1', '1.0.0'],
                    engine: ['1.0.0', '1.0.0'],
                },
                {
                    description:
                        'only the engine provides a non-versioned variant of shared',
                    app: ['^1.0.0', '1.0.0'],
                    engine: ['1.0.0', 'ec5bfa74'],
                },
                {
                    description:
                        'only the app requires a non-versioned variant of shared',
                    app: ['^1.0.0', 'ec5bfa74'],
                    engine: ['1.0.0', '1.0.0'],
                },
                {
                    description: 'the app requires a newer version of shared',
                    app: ['^1.0.0', '1.0.1'],
                    engine: ['1.0.0', '1.0.0'],
                },
            ].forEach(
                ({
                    description,
                    app: [engineVersion, sharedVersion],
                    engine: [providedVersionOfEngine, providedVersionOfShared],
                }) => {
                    const appSpec = { engineVersion, sharedVersion };
                    const engineSpec = {
                        providedVersionOfEngine,
                        providedVersionOfShared,
                    };

                    it(`${description}, with app spec ${inspect(
                        appSpec
                    )} and engine spec ${inspect(engineSpec)}`, () => {
                        expect(
                            checkAppCompatibility(appSpec, engineSpec)
                        ).toMatchObject(failingCheck);
                    });
                }
            );
        });

        describe('all checks are successful if', () => {
            [
                {
                    description: 'all versions are exactly as specified',
                    app: ['^1.0.0', '1.0.0'],
                    engine: ['1.0.0', '1.0.0'],
                },
                {
                    description: 'the provided versions are higher as required',
                    app: ['^1.0.0', '1.0.0'],
                    engine: ['1.0.1', '1.0.1'],
                },
                {
                    description:
                        'both use the same non-versioned variant of shared',
                    app: ['^1.0.0', 'ec5bfa74'],
                    engine: ['1.0.0', 'ec5bfa74'],
                },
                {
                    description: 'the app does not require shared',
                    app: ['^1.0.0', undefined],
                    engine: ['1.0.0', 'ec5bfa74'],
                },
            ].forEach(
                ({
                    description,
                    app: [engineVersion, sharedVersion],
                    engine: [providedVersionOfEngine, providedVersionOfShared],
                }) => {
                    const appSpec = { engineVersion, sharedVersion };
                    const engineSpec = {
                        providedVersionOfEngine,
                        providedVersionOfShared,
                    };

                    it(`${description}, with app spec ${inspect(
                        appSpec
                    )} and engine spec ${inspect(engineSpec)}`, () => {
                        expect(
                            checkAppCompatibility(appSpec, engineSpec)
                        ).toMatchObject(successfulCheck);
                    });
                }
            );
        });
    });
});
