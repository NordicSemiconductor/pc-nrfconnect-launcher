/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getUseChineseAppServer } from '../common/persistedStore';
import { determineEffectiveUrl } from './net';

jest.mock('../common/persistedStore');

describe('determineEffectiveUrl', () => {
    it('does not change URLs which already use the download API', () => {
        expect(
            determineEffectiveUrl(
                'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external/ncd/apps/official/source.json'
            )
        ).toBe(
            'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external/ncd/apps/official/source.json'
        );
    });

    it('does not change URLs on other servers', () => {
        expect(
            determineEffectiveUrl('https://example.org/artifactory/this/that')
        ).toBe('https://example.org/artifactory/this/that');
    });

    it('changes URLs from short artifactory format to download API format', () => {
        expect(
            determineEffectiveUrl(
                'https://files.nordicsemi.com/artifactory/swtools/internal/ncd/apps/experimental/source.json'
            )
        ).toBe(
            'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=internal/ncd/apps/experimental/source.json'
        );
    });

    it('uses the chinese server when requested', () => {
        jest.mocked(getUseChineseAppServer).mockReturnValue(true);

        expect(
            determineEffectiveUrl(
                'https://files.nordicsemi.com/artifactory/swtools/external/ncd/apps/official/source.json'
            )
        ).toBe(
            'https://files.nordicsemi.cn/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external/ncd/apps/official/source.json'
        );
    });

    it('does not use the Chinese server for non-public sources', () => {
        jest.mocked(getUseChineseAppServer).mockReturnValue(true);

        expect(
            determineEffectiveUrl(
                'https://files.nordicsemi.com/artifactory/swtools/internal/ncd/apps/experimental/source.json'
            )
        ).toBe(
            'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=internal/ncd/apps/experimental/source.json'
        );
    });
});
