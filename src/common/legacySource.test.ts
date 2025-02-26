/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { migrateAllURLsInJSON, migrateURL } from './legacySource';

describe('converting URLs from developer.nordicsemi.com to files.nordicsemi.com', () => {
    test('official is in external', () => {
        expect(
            migrateURL(
                'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/source.json'
            )
        ).toBe(
            'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external/ncd/apps/official/source.json'
        );
    });

    test('3.*-apps are in external', () => {
        expect(
            migrateURL(
                'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/3.7-apps/pc-nrfconnect-rssi.json'
            )
        ).toBe(
            'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external/ncd/apps/3.7-apps/pc-nrfconnect-rssi.json'
        );

        expect(
            migrateURL(
                'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/3.11-apps/pc-nrfconnect-ble.json'
            )
        ).toBe(
            'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external/ncd/apps/3.11-apps/pc-nrfconnect-ble.json'
        );
    });

    test('direction-finding is external-confidential', () => {
        expect(
            migrateURL(
                'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/directionfinding/source.json'
            )
        ).toBe(
            'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external-confidential/ncd/apps/directionfinding/source.json'
        );
    });

    test('everything else is internal', () => {
        expect(
            migrateURL(
                'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/secret/pc-nrfconnect-secret.json'
            )
        ).toBe(
            'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=internal/ncd/apps/secret/pc-nrfconnect-secret.json'
        );
    });
});

test('migrateAllURLsInJSON', () => {
    expect(
        migrateAllURLsInJSON(`{
  "homepage": "https://github.com/NordicPlayground/pc-nrfconnect-boilerplate",
  "iconUrl": "https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/pc-nrfconnect-boilerplate.svg",
  "releaseNotesUrl": "https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/3.7-apps/pc-nrfconnect-boilerplate-Changelog.md",
  "versions": {
    "1.0.0": {
      "tarballUrl": "https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/directionfinding/pc-nrfconnect-npm-1.0.0.tgz"
    },
    "2.0.0": {
      "tarballUrl": "https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/secret/pc-nrfconnect-npm-2.0.0.tgz"
    }
  }
}`)
    ).toBe(
        `{
  "homepage": "https://github.com/NordicPlayground/pc-nrfconnect-boilerplate",
  "iconUrl": "https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external/ncd/apps/official/pc-nrfconnect-boilerplate.svg",
  "releaseNotesUrl": "https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external/ncd/apps/3.7-apps/pc-nrfconnect-boilerplate-Changelog.md",
  "versions": {
    "1.0.0": {
      "tarballUrl": "https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external-confidential/ncd/apps/directionfinding/pc-nrfconnect-npm-1.0.0.tgz"
    },
    "2.0.0": {
      "tarballUrl": "https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=internal/ncd/apps/secret/pc-nrfconnect-npm-2.0.0.tgz"
    }
  }
}`
    );
});
