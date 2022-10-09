/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');

const REPORTS_FOLDER = 'launcher-test-reports';
const FINAL_OUTPUT_FOLDER = 'launcher-coverage';

const run = commands => {
    commands.forEach(command => execSync(command, { stdio: 'inherit' }));
};

// Create the reports folder and move the reports from cypress and jest inside it
fs.emptyDirSync(REPORTS_FOLDER);
fs.copyFileSync(
    'test-e2e/playwright-coverage/coverage-final.json',
    `${REPORTS_FOLDER}/from-playwright.json`
);

fs.copyFileSync(
    'src/jest-coverage/coverage-final.json',
    `${REPORTS_FOLDER}/from-jest.json`
);

// fs.emptyDirSync('.nyc_output');
fs.emptyDirSync(FINAL_OUTPUT_FOLDER);

// Run "nyc merge" inside the reports folder, merging the two coverage files into one,
// then generate the final report on the coverage folder
run([
    // "nyc merge" will create a "coverage.json" file on the root, we move it to .nyc_output
    `npx nyc merge ${REPORTS_FOLDER}`,
    `mv coverage.json ${FINAL_OUTPUT_FOLDER}/coverage.json`,
    // will fail if coverage threshold not met
    `npx nyc report --reporter text --report-dir ${FINAL_OUTPUT_FOLDER}`,
]);
