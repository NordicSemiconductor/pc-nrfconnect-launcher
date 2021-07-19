import { PackageJson } from 'pc-nrfconnect-shared';

declare const requiredVersionOfShared: (
    packageJson: PackageJson
) => string | undefined;

export default requiredVersionOfShared;
