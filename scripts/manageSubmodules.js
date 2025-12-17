#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ORG = 'NordicSemiconductor';
const SUBMODULES_DIR = path.join(__dirname, '..', 'doc', 'submodules');
const CONFIG_FILE = path.join(__dirname, '..', 'doc', 'submodules.json');
const DEBUG_LOG = path.join(__dirname, '..', '.cursor', 'debug.log');

function debugLog(data) {
    try {
        const logDir = path.dirname(DEBUG_LOG);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        fs.appendFileSync(DEBUG_LOG, JSON.stringify(data) + '\n');
    } catch (e) {
        // Ignore logging errors
    }
}

function exec(command, options = {}) {
    try {
        return execSync(command, {
            stdio: 'inherit',
            cwd: options.cwd || process.cwd(),
            ...options
        });
    } catch (error) {
        console.error(`Error executing: ${command}`);
        throw error;
    }
}

function readConfig() {
    if (!fs.existsSync(CONFIG_FILE)) {
        console.error(`Configuration file not found: ${CONFIG_FILE}`);
        process.exit(1);
    }
    const content = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(content);
}

function writeConfig(config) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n');
}

function getRepoUrl(repoName) {
    return `https://github.com/${ORG}/${repoName}.git`;
}

function getSubmodulePath(repoName) {
    // #region agent log
    const submodulePath = path.join(SUBMODULES_DIR, repoName);
    debugLog({location:'manageSubmodules.js:42',message:'getSubmodulePath computed path',data:{repoName,submodulePath,isAbsolute:path.isAbsolute(submodulePath),submodulesDir:SUBMODULES_DIR,pathSeparator:path.sep},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'});
    // #endregion
    return submodulePath;
}

function configureSparseCheckout(submodulePath) {
    // Get the actual git directory (handles both .git as file and directory)
    let gitDir;
    const gitFile = path.join(submodulePath, '.git');
    if (fs.existsSync(gitFile)) {
        const stat = fs.statSync(gitFile);
        if (stat.isFile()) {
            // .git is a file pointing to the actual git dir
            const content = fs.readFileSync(gitFile, 'utf8').trim();
            if (content.startsWith('gitdir: ')) {
                gitDir = path.resolve(submodulePath, content.substring(8));
            } else {
                gitDir = gitFile;
            }
        } else {
            gitDir = gitFile;
        }
    } else {
        console.warn(`Warning: .git not found in ${submodulePath}`);
        return;
    }

    const infoDir = path.join(gitDir, 'info');
    const sparseCheckoutFile = path.join(infoDir, 'sparse-checkout');

    // Ensure info directory exists
    if (!fs.existsSync(infoDir)) {
        fs.mkdirSync(infoDir, { recursive: true });
    }

    // Write sparse-checkout configuration
    fs.writeFileSync(sparseCheckoutFile, 'doc/*\n');

    // Configure git to use sparse-checkout
    exec(`git config core.sparseCheckout true`, { cwd: submodulePath });

    // Apply sparse-checkout
    exec(`git read-tree -mu HEAD`, { cwd: submodulePath });
}

function moveDocContentsUp(submodulePath) {
    const docPath = path.join(submodulePath, 'doc');
    if (!fs.existsSync(docPath)) {
        console.warn(`Warning: doc folder not found in ${submodulePath}`);
        return;
    }

    // Move all contents from doc/ to the submodule root
    const files = fs.readdirSync(docPath);
    for (const file of files) {
        const src = path.join(docPath, file);
        const dest = path.join(submodulePath, file);
        if (fs.existsSync(dest)) {
            // If destination exists, merge directories or skip
            const srcStat = fs.statSync(src);
            const destStat = fs.statSync(dest);
            if (srcStat.isDirectory() && destStat.isDirectory()) {
                // Merge directories
                const subFiles = fs.readdirSync(src);
                for (const subFile of subFiles) {
                    const subSrc = path.join(src, subFile);
                    const subDest = path.join(dest, subFile);
                    if (!fs.existsSync(subDest)) {
                        fs.renameSync(subSrc, subDest);
                    }
                }
            }
        } else {
            fs.renameSync(src, dest);
        }
    }

    // Remove empty doc directory
    try {
        fs.rmdirSync(docPath);
    } catch (error) {
        // Directory might not be empty, that's okay
    }
}

function initSubmodule(repoName) {
    const repoUrl = getRepoUrl(repoName);
    const submodulePath = getSubmodulePath(repoName);

    // Get repository root for computing relative paths
    const cwd = process.cwd();
    let repoRoot = '';
    try {
        repoRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8', stdio: 'pipe' }).trim();
    } catch (e) {
        repoRoot = cwd; // Fallback to current directory
    }
    const relativePathForGit = path.relative(repoRoot || cwd, submodulePath).replace(/\\/g, '/');

    // #region agent log
    const relativePath = path.relative(repoRoot || cwd, submodulePath);
    debugLog({location:'manageSubmodules.js:142',message:'initSubmodule entry',data:{repoName,repoUrl,submodulePath,isAbsolute:path.isAbsolute(submodulePath),cwd,repoRoot,relativePath,relativePathForGit,pathUsesBackslashes:submodulePath.includes('\\')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C'});
    // #endregion

    console.log(`Initializing submodule: ${repoName}`);

    // Check if submodule already exists
    if (fs.existsSync(submodulePath)) {
        console.log(`Submodule ${repoName} already exists, updating...`);
        exec(`git submodule update --init --recursive ${submodulePath}`);
    } else {
        // Ensure submodules directory exists
        if (!fs.existsSync(SUBMODULES_DIR)) {
            fs.mkdirSync(SUBMODULES_DIR, { recursive: true });
        }

        // #region agent log
        const gitCommand = `git submodule add ${repoUrl} ${relativePathForGit}`;
        debugLog({location:'manageSubmodules.js:170',message:'Before git submodule add',data:{gitCommand,submodulePath,relativePathForGit,repoRoot,cwd},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A,B,C,D'});
        // #endregion

        // Add submodule using relative path (Git requires relative paths)
        exec(`git submodule add ${repoUrl} ${relativePathForGit}`);
    }

    // Configure sparse-checkout
    configureSparseCheckout(submodulePath);

    // Move doc contents up one level
    moveDocContentsUp(submodulePath);

    console.log(`✓ Submodule ${repoName} initialized successfully`);
}

function updateSubmodule(repoName) {
    const submodulePath = getSubmodulePath(repoName);

    if (!fs.existsSync(submodulePath)) {
        console.log(`Submodule ${repoName} does not exist, initializing...`);
        initSubmodule(repoName);
        return;
    }

    console.log(`Updating submodule: ${repoName}`);

    // Update submodule to the commit referenced by the parent repo
    exec(`git submodule update --init --recursive ${submodulePath}`);

    // Re-apply sparse-checkout after update
    configureSparseCheckout(submodulePath);

    // Move doc contents up one level
    moveDocContentsUp(submodulePath);

    console.log(`✓ Submodule ${repoName} updated successfully`);
}

function addSubmodule(repoName) {
    const config = readConfig();

    if (config.repos.includes(repoName)) {
        console.log(`Submodule ${repoName} is already in configuration`);
        return;
    }

    // Validate repo name format
    if (!repoName.startsWith('pc-nrfconnect-')) {
        console.error(`Error: Repository name must start with 'pc-nrfconnect-'`);
        process.exit(1);
    }

    config.repos.push(repoName);
    writeConfig(config);

    initSubmodule(repoName);
    console.log(`✓ Submodule ${repoName} added successfully`);
}

function removeSubmodule(repoName) {
    const config = readConfig();

    if (!config.repos.includes(repoName)) {
        console.log(`Submodule ${repoName} is not in configuration`);
        return;
    }

    const submodulePath = getSubmodulePath(repoName);

    // Remove from git
    if (fs.existsSync(submodulePath)) {
        exec(`git submodule deinit -f ${submodulePath}`);
        exec(`git rm -f ${submodulePath}`);

        // Remove directory if it still exists
        if (fs.existsSync(submodulePath)) {
            fs.rmSync(submodulePath, { recursive: true, force: true });
        }
    }

    // Remove from config
    config.repos = config.repos.filter(r => r !== repoName);
    writeConfig(config);

    console.log(`✓ Submodule ${repoName} removed successfully`);
}

function init() {
    const config = readConfig();
    console.log(`Initializing ${config.repos.length} submodule(s)...`);

    for (const repo of config.repos) {
        try {
            initSubmodule(repo);
        } catch (error) {
            console.error(`Failed to initialize ${repo}:`, error.message);
            process.exit(1);
        }
    }

    console.log('✓ All submodules initialized successfully');
}

function update() {
    const config = readConfig();
    console.log(`Updating ${config.repos.length} submodule(s)...`);

    for (const repo of config.repos) {
        try {
            updateSubmodule(repo);
        } catch (error) {
            console.error(`Failed to update ${repo}:`, error.message);
            process.exit(1);
        }
    }

    console.log('✓ All submodules updated successfully');
}

// Main command handling
const command = process.argv[2];
const repoName = process.argv[3];

switch (command) {
    case 'init':
        init();
        break;
    case 'update':
        update();
        break;
    case 'add':
        if (!repoName) {
            console.error('Error: Repository name required');
            console.error('Usage: node manageSubmodules.js add <repo-name>');
            process.exit(1);
        }
        addSubmodule(repoName);
        break;
    case 'remove':
        if (!repoName) {
            console.error('Error: Repository name required');
            console.error('Usage: node manageSubmodules.js remove <repo-name>');
            process.exit(1);
        }
        removeSubmodule(repoName);
        break;
    default:
        console.error('Usage: node manageSubmodules.js <command> [repo-name]');
        console.error('Commands:');
        console.error('  init              - Initialize all configured submodules');
        console.error('  update            - Update all configured submodules');
        console.error('  add <repo-name>   - Add a new submodule');
        console.error('  remove <repo-name> - Remove a submodule');
        process.exit(1);
}

