const { execSync } = require('child_process');
const fs = require('fs-extra');

const REPORTS_FOLDER = 'reports';
const FINAL_OUTPUT_FOLDER = 'coverage';

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

fs.emptyDirSync('.nyc_output');
fs.emptyDirSync(FINAL_OUTPUT_FOLDER);

// Run "nyc merge" inside the reports folder, merging the two coverage files into one,
// then generate the final report on the coverage folder
run([
    // "nyc merge" will create a "coverage.json" file on the root, we move it to .nyc_output
    `npx nyc merge ${REPORTS_FOLDER} && mv coverage.json .nyc_output/out.json`,
    `npx nyc report --reporter lcov --report-dir ${FINAL_OUTPUT_FOLDER}`,
]);
