/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NrfutilSandbox } from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil';
import { resolveModuleVersion } from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/moduleVersion';
import { inspect } from 'util';

import { LaunchableApp } from '../../ipc/apps';
import { createDownloadableTestApp } from '../../test/testFixtures';
import appCompatibilityWarning, {
    checkEngineIsSupported,
    checkEngineVersionIsSet,
} from './appCompatibilityWarning';

const requiringEngine = (engineVersion?: string): LaunchableApp =>
    createDownloadableTestApp(undefined, { engineVersion });

const failingCheck = (warning: string) => ({
    isDecided: true,
    isCompatible: false,
    warning,
    longWarning: expect.anything(),
});

const undecidedCheck = {
    isDecided: false,
};

jest.mock('@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/sandbox', () => ({
    __esModule: true,
    default: () =>
        Promise.resolve({
            getModuleVersion: () => Promise.resolve([]),
        } as unknown as NrfutilSandbox),
}));

jest.mock('@nordicsemiconductor/pc-nrfconnect-shared', () => ({
    ...jest.requireActual('@nordicsemiconductor/pc-nrfconnect-shared'),
    getUserDataDir: () => '',
}));

jest.mock('@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/moduleVersion');

describe('check compatibility of an app with the launcher', () => {
    describe('check if the app sets an engine version', () => {
        it('fails without an engine version', () => {
            expect(
                checkEngineVersionIsSet(
                    requiringEngine(undefined),
                    'irrelevant'
                )
            ).toMatchObject(
                failingCheck(
                    'The app does not specify which nRF Connect for Desktop versions it supports'
                )
            );
        });

        it('is undecided if any engine version is set', () => {
            expect(
                checkEngineVersionIsSet(requiringEngine('^1.0.0'), 'irrelevant')
            ).toMatchObject(undecidedCheck);
        });
    });

    describe('check if the engine version is what the app requires', () => {
        it('is undecided if the app requires a lower version', () => {
            expect(
                checkEngineIsSupported(requiringEngine('^1.0.0'), '1.2.3')
            ).toMatchObject(undecidedCheck);
        });

        it('treats caret ranges as greater-equal', () => {
            expect(
                checkEngineIsSupported(requiringEngine('^1.0.0'), '2.0.0')
            ).toMatchObject(undecidedCheck);
        });

        it('is undecided if the app requires the same version', () => {
            expect(
                checkEngineIsSupported(requiringEngine('^1.2.3'), '1.2.3')
            ).toMatchObject(undecidedCheck);
        });

        it('is undecided if the engine is just a pre-release', () => {
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
            ).toMatchObject(
                failingCheck(
                    'The app only supports nRF Connect for Desktop ^2.0.0, which does not match your currently installed version'
                )
            );
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
                    const appSpec = requiringEngine(engineVersion);
                    const engineSpec = providedVersionOfEngine;

                    it(`${description}, with app spec ${inspect(
                        appSpec
                    )} and engine spec ${inspect(engineSpec)}`, async () => {
                        const compatibilityWarning =
                            await appCompatibilityWarning(
                                appSpec,
                                providedVersionOfEngine
                            );
                        expect(compatibilityWarning?.warning).toBeDefined();
                        expect(compatibilityWarning?.longWarning).toBeDefined();
                    });
                }
            );

            it('The app version is too old according to the list of minimal required versions', async () => {
                const compatibilityWarning = await appCompatibilityWarning(
                    createDownloadableTestApp('pc-nrfconnect-dtm', {
                        currentVersion: '2.0.3',
                        engineVersion: '1.0.0',
                    }),
                    '1.0.0'
                );
                expect(compatibilityWarning?.warning).toBeDefined();
                expect(compatibilityWarning?.longWarning).toBeDefined();
            });
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
                    const appSpec = requiringEngine(engineVersion);
                    const engineSpec = providedVersionOfEngine;

                    it(`${description}, with app spec ${inspect(
                        appSpec
                    )} and engine spec ${inspect(engineSpec)}`, async () => {
                        expect(
                            await appCompatibilityWarning(
                                appSpec,
                                providedVersionOfEngine
                            )
                        ).toBeUndefined();
                    });
                }
            );
        });

        describe('Jlink Tests', () => {
            const app = (nrfutilDeviceVersion: string): LaunchableApp => ({
                engineVersion: '5.0.0',
                source: '',
                latestVersion: 'v1.0.0',
                isWithdrawn: true,
                name: 'name',
                displayName: '',
                iconPath: '',
                description: 'All versions are exactly as specified',
                currentVersion: 'v1.0.0',
                // @ts-expect-error -- Needs to be added to Installed in shared as `nrfutil?: NrfutilModules;`
                nrfutil: { device: [nrfutilDeviceVersion] },
                installed: { path: '' },
            });

            it(`No installed J-Link as reported before nrfutil-device 2.7`, async () => {
                jest.mocked(resolveModuleVersion).mockReturnValue(undefined);

                expect(
                    (await appCompatibilityWarning(app('2.0.0'), '5.0.0'))
                        ?.warning
                ).toBe(
                    'Required SEGGER J-Link not found: expected version V7.88j'
                );
            });

            it(`No installed J-Link as reported since nrfutil-device 2.7`, async () => {
                // @ts-expect-error -- The type for dependencies still needs to be updated in shared
                jest.mocked(resolveModuleVersion).mockReturnValue({
                    expectedVersion: {
                        versionFormat: 'string',
                        version: 'JLink_V7.94i',
                    },
                    name: 'JlinkARM',
                });

                expect(
                    (await appCompatibilityWarning(app('2.0.1'), '5.0.0'))
                        ?.warning
                ).toBe(
                    'Required SEGGER J-Link not found: expected version V7.88j'
                );
            });

            it(`Wrong JLink version`, async () => {
                jest.mocked(resolveModuleVersion).mockReturnValue({
                    expectedVersion: {
                        versionFormat: 'string',
                        version: 'JLink_V7.94i',
                    },
                    name: 'JlinkARM',
                    versionFormat: 'string',
                    version: 'JLink_V7.94e',
                });

                expect(
                    (await appCompatibilityWarning(app('2.0.2'), '5.0.0'))
                        ?.warning
                ).toBe(
                    'Untested version V7.94e of SEGGER J-Link found: expected at least version V7.94i'
                );
            });

            it('Calls resolveModuleVersion exactly once per version of nrfutil-device', async () => {
                const mockedGetSandbox = jest
                    .mocked(resolveModuleVersion)
                    .mockReset();

                await appCompatibilityWarning(app('3.0.0'), '5.0.0');
                await appCompatibilityWarning(app('3.0.0'), '5.0.0');
                await appCompatibilityWarning(app('3.0.1'), '5.0.0');
                await appCompatibilityWarning(app('3.0.2'), '5.0.0');

                expect(mockedGetSandbox).toBeCalledTimes(3);
            });
        });
    });
});
