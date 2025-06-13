/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { determineDownloadUrl } from './artifactoryUrl';

describe('determineDownloadUrl', () => {
    it('does not change URLs which already use the download API', () => {
        expect(
            determineDownloadUrl(
                'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external/ncd/apps/official/source.json',
                false
            )
        ).toBe(
            'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external/ncd/apps/official/source.json'
        );
    });

    it('does not change URLs on other servers', () => {
        expect(
            determineDownloadUrl(
                'https://example.org/artifactory/this/that',
                true
            )
        ).toBe('https://example.org/artifactory/this/that');
    });

    it('changes URLs from short artifactory format to download API format', () => {
        expect(
            determineDownloadUrl(
                'https://files.nordicsemi.com/artifactory/swtools/internal/ncd/apps/experimental/source.json',
                false
            )
        ).toBe(
            'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=internal/ncd/apps/experimental/source.json'
        );
    });

    it('uses the chinese server when requested', () => {
        expect(
            determineDownloadUrl(
                'https://files.nordicsemi.com/artifactory/swtools/external/ncd/apps/official/source.json',
                true
            )
        ).toBe(
            'https://files.nordicsemi.cn/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external/ncd/apps/official/source.json'
        );
    });

    it('does not use the Chinese server for non-public sources', () => {
        expect(
            determineDownloadUrl(
                'https://files.nordicsemi.com/artifactory/swtools/internal/ncd/apps/experimental/source.json',
                true
            )
        ).toBe(
            'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=internal/ncd/apps/experimental/source.json'
        );
    });
});
