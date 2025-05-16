/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

type ArtifactoryUrlSpec = {
    tld: 'cn' | 'com';
    repo: string;
    path: string;
};

type ArtifactoryUrlMatch = {
    groups: ArtifactoryUrlSpec;
} | null;

export const isNordicArtifactoryUrl = (url: string) =>
    url.startsWith('https://files.nordicsemi.com/') ||
    url.startsWith('https://files.nordicsemi.cn/');

export const shortNordicArtifactoryUrl = ({
    tld,
    repo,
    path,
}: ArtifactoryUrlSpec) =>
    `https://files.nordicsemi.${tld}/artifactory/${repo}/${path}`;

export const asShortNordicArtifactoryUrl = (url: string) => {
    const longArtifactoryUrlRegex =
        /^https:\/\/files\.nordicsemi\.(?<tld>com|cn)\/ui\/api\/v1\/download\?isNativeBrowsing=false&repoKey=(?<repo>[^&]+)&path=(?<path>.*)/;
    const match = url.match(longArtifactoryUrlRegex) as ArtifactoryUrlMatch;

    if (match == null) return url;

    return shortNordicArtifactoryUrl(match.groups);
};

export const longNordicArtifactoryUrl = ({
    tld,
    repo,
    path,
}: ArtifactoryUrlSpec) =>
    `https://files.nordicsemi.${tld}/ui/api/v1/download?isNativeBrowsing=false&repoKey=${repo}&path=${path}`;

export const asLongNordicArtifactoryUrl = (url: string) => {
    const shortArtifactoryUrlRegex =
        /^https:\/\/files\.nordicsemi\.(?<tld>cn|com)\/artifactory\/(?<repo>[^/]+)\/(?<path>.*)/;

    const match = url.match(shortArtifactoryUrlRegex) as ArtifactoryUrlMatch;

    if (match == null) return url;

    return longNordicArtifactoryUrl(match.groups);
};

const isPublicUrl = (url: string) =>
    asShortNordicArtifactoryUrl(url).startsWith(
        'https://files.nordicsemi.com/artifactory/swtools/external/'
    );

export const needsAuthentication = (url: string) =>
    asShortNordicArtifactoryUrl(url).startsWith(
        'https://files.nordicsemi.com/artifactory/'
    ) && !isPublicUrl(url);

const maybeUseChineseServer = (url: string, prefersChineseAppServer: boolean) =>
    isPublicUrl(url) && prefersChineseAppServer
        ? url.replace('//files.nordicsemi.com/', '//files.nordicsemi.cn/')
        : url;

export const determineDownloadUrl = (
    url: string,
    prefersChineseAppServer: boolean
) =>
    maybeUseChineseServer(
        asLongNordicArtifactoryUrl(url),
        prefersChineseAppServer
    );

export const artifactoryTokenInformationUrl =
    'https://files.nordicsemi.com/access/api/v1/tokens/me';

export const artifactoryPingUrl =
    'https://files.nordicsemi.com/api/system/ping';
