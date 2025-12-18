#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ORG = 'NordicSemiconductor';
const SUBMODULES_DIR = path.join(__dirname, '..', 'doc', 'docs', 'submodules');
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

/**
 * Get the git-tracked path from .gitmodules
 */
function getGitSubmodulePath(repoName) {
    const gitmodulesPath = path.join(__dirname, '..', '.gitmodules');
    if (!fs.existsSync(gitmodulesPath)) {
        return null;
    }

    const content = fs.readFileSync(gitmodulesPath, 'utf8');
    const lines = content.split('\n');
    let inSubmodule = false;
    let submodulePath = null;

    for (const line of lines) {
        const trimmed = line.trim();

        // Check for submodule section header
        if (trimmed.startsWith('[submodule')) {
            // Extract path from [submodule "path"]
            const match = trimmed.match(/\[submodule\s+"([^"]+)"\]/);
            if (match) {
                const modulePath = match[1];
                // Check if this submodule matches our repo name
                if (modulePath.endsWith(repoName) || modulePath.includes(`/${repoName}`) || modulePath.includes(`\\${repoName}`)) {
                    inSubmodule = true;
                    submodulePath = modulePath;
                } else {
                    inSubmodule = false;
                    submodulePath = null;
                }
            }
        } else if (inSubmodule && trimmed.startsWith('path')) {
            // Found path = value line for our submodule
            const match = trimmed.match(/path\s*=\s*(.+)/);
            if (match) {
                const actualPath = match[1].trim();
                return path.resolve(__dirname, '..', actualPath);
            }
        } else if (trimmed.startsWith('[') && inSubmodule) {
            // Hit next section, stop looking
            break;
        }
    }

    // Fallback: if we found a submodule path but no path= line, use the section name
    if (submodulePath) {
        return path.resolve(__dirname, '..', submodulePath);
    }

    return null;
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

    // Only copy docs/ directory and mkdocs.yml file, skip zoomin/
    const files = fs.readdirSync(docPath);
    for (const file of files) {
        // Skip zoomin directory
        if (file === 'zoomin') {
            continue;
        }

        const src = path.join(docPath, file);
        const dest = path.join(submodulePath, file);

        // Only copy docs/ directory and mkdocs.yml file
        if (file === 'docs' || file === 'mkdocs.yml') {
            if (fs.existsSync(dest)) {
                // If destination exists, remove it first
                const destStat = fs.statSync(dest);
                if (destStat.isDirectory()) {
                    fs.rmSync(dest, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(dest);
                }
            }
            const srcStat = fs.statSync(src);
            if (srcStat.isDirectory()) {
                // Copy directory recursively
                fs.cpSync(src, dest, { recursive: true });
            } else {
                // Copy file
                fs.copyFileSync(src, dest);
            }
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
    const newSubmodulePath = getSubmodulePath(repoName);
    const gitTrackedPath = getGitSubmodulePath(repoName);

    // Get repository root for computing relative paths
    const cwd = process.cwd();
    let repoRoot = '';
    try {
        repoRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8', stdio: 'pipe' }).trim();
    } catch (e) {
        repoRoot = cwd; // Fallback to current directory
    }

    // #region agent log
    const relativePath = path.relative(repoRoot || cwd, newSubmodulePath);
    debugLog({location:'manageSubmodules.js:142',message:'initSubmodule entry',data:{repoName,repoUrl,newSubmodulePath,gitTrackedPath,isAbsolute:path.isAbsolute(newSubmodulePath),cwd,repoRoot,relativePath,pathUsesBackslashes:newSubmodulePath.includes('\\')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C'});
    // #endregion

    console.log(`Initializing submodule: ${repoName}`);

    // Check if submodule already exists at either old or new location
    const existsAtOldPath = gitTrackedPath && fs.existsSync(gitTrackedPath);
    const existsAtNewPath = fs.existsSync(newSubmodulePath);

    if (existsAtOldPath || existsAtNewPath) {
        console.log(`Submodule ${repoName} already exists, updating...`);
        // Use git-tracked path for git operations if it exists
        const pathForGit = gitTrackedPath || newSubmodulePath;
        const relativePathForGit = path.relative(repoRoot || cwd, pathForGit).replace(/\\/g, '/');
        exec(`git submodule update --init --recursive "${relativePathForGit}"`);

        // Use the actual existing path for post-processing
        const actualPath = existsAtOldPath ? gitTrackedPath : newSubmodulePath;
        configureSparseCheckout(actualPath);
        moveDocContentsUp(actualPath);

        // Migrate if needed
        if (existsAtOldPath && gitTrackedPath !== newSubmodulePath) {
            console.log(`Migrating submodule from ${gitTrackedPath} to ${newSubmodulePath}...`);
            const newDir = path.dirname(newSubmodulePath);
            if (!fs.existsSync(newDir)) {
                fs.mkdirSync(newDir, { recursive: true });
            }
            if (fs.existsSync(newSubmodulePath)) {
                fs.rmSync(newSubmodulePath, { recursive: true, force: true });
            }
            fs.renameSync(gitTrackedPath, newSubmodulePath);

            // Update .gitmodules
            const gitmodulesPath = path.join(__dirname, '..', '.gitmodules');
            let gitmodulesContent = fs.readFileSync(gitmodulesPath, 'utf8');
            const oldRelativePath = path.relative(repoRoot || cwd, gitTrackedPath).replace(/\\/g, '/');
            const newRelativePath = path.relative(repoRoot || cwd, newSubmodulePath).replace(/\\/g, '/');
            gitmodulesContent = gitmodulesContent.replace(
                new RegExp(`(path\\s*=\\s*)${oldRelativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'),
                `$1${newRelativePath}`
            );
            fs.writeFileSync(gitmodulesPath, gitmodulesContent);

            // Update git index
            exec(`git add .gitmodules`);
            exec(`git rm --cached "${oldRelativePath}"`);
            exec(`git add "${newRelativePath}"`);
        }
    } else {
        // Ensure submodules directory exists
        if (!fs.existsSync(SUBMODULES_DIR)) {
            fs.mkdirSync(SUBMODULES_DIR, { recursive: true });
        }

        const relativePathForGit = path.relative(repoRoot || cwd, newSubmodulePath).replace(/\\/g, '/');

        // #region agent log
        const gitCommand = `git submodule add ${repoUrl} ${relativePathForGit}`;
        debugLog({location:'manageSubmodules.js:170',message:'Before git submodule add',data:{gitCommand,newSubmodulePath,relativePathForGit,repoRoot,cwd},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A,B,C,D'});
        // #endregion

        // Add submodule using relative path (Git requires relative paths)
        exec(`git submodule add ${repoUrl} "${relativePathForGit}"`);

        // Configure sparse-checkout
        configureSparseCheckout(newSubmodulePath);

        // Move doc contents up one level
        moveDocContentsUp(newSubmodulePath);
    }

    console.log(`✓ Submodule ${repoName} initialized successfully`);
}

function updateSubmodule(repoName) {
    // Get git-tracked path (may be old path) and new desired path
    const gitTrackedPath = getGitSubmodulePath(repoName);
    const newSubmodulePath = getSubmodulePath(repoName);

    // Check if submodule exists at either old or new location
    const existsAtOldPath = gitTrackedPath && fs.existsSync(gitTrackedPath);
    const existsAtNewPath = fs.existsSync(newSubmodulePath);

    if (!existsAtOldPath && !existsAtNewPath) {
        console.log(`Submodule ${repoName} does not exist, initializing...`);
        initSubmodule(repoName);
        return;
    }

    console.log(`Updating submodule: ${repoName}`);

    // Get repository root for computing relative paths
    const cwd = process.cwd();
    let repoRoot = '';
    try {
        repoRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8', stdio: 'pipe' }).trim();
    } catch (e) {
        repoRoot = cwd;
    }

    // Use git-tracked path for git operations (git needs to know about it)
    const pathForGit = gitTrackedPath || newSubmodulePath;
    const relativePathForGit = path.relative(repoRoot || cwd, pathForGit).replace(/\\/g, '/');

    // Update submodule to the commit referenced by the parent repo
    exec(`git submodule update --init --recursive "${relativePathForGit}"`);

    // Determine which path to use for post-processing
    const actualPath = existsAtOldPath ? gitTrackedPath : newSubmodulePath;

    // Re-apply sparse-checkout after update
    configureSparseCheckout(actualPath);

    // Move doc contents up one level
    moveDocContentsUp(actualPath);

    // If submodule is at old path, migrate it to new path
    if (existsAtOldPath && gitTrackedPath && gitTrackedPath !== newSubmodulePath) {
        console.log(`Migrating submodule from ${gitTrackedPath} to ${newSubmodulePath}...`);

        // Ensure new directory exists
        const newDir = path.dirname(newSubmodulePath);
        if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir, { recursive: true });
        }

        // Move the submodule directory
        if (fs.existsSync(newSubmodulePath)) {
            fs.rmSync(newSubmodulePath, { recursive: true, force: true });
        }
        fs.renameSync(gitTrackedPath, newSubmodulePath);

        // Update .gitmodules to reflect new path
        const gitmodulesPath = path.join(__dirname, '..', '.gitmodules');
        let gitmodulesContent = fs.readFileSync(gitmodulesPath, 'utf8');
        const oldRelativePath = path.relative(repoRoot || cwd, gitTrackedPath).replace(/\\/g, '/');
        const newRelativePath = path.relative(repoRoot || cwd, newSubmodulePath).replace(/\\/g, '/');
        gitmodulesContent = gitmodulesContent.replace(
            new RegExp(`(path\\s*=\\s*)${oldRelativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'),
            `$1${newRelativePath}`
        );
        fs.writeFileSync(gitmodulesPath, gitmodulesContent);

        // Update git index
        exec(`git add .gitmodules`);
        exec(`git rm --cached "${oldRelativePath}"`);
        exec(`git add "${newRelativePath}"`);

        console.log(`✓ Submodule migrated to new location`);
    }

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

    // Get both old and new paths
    const gitTrackedPath = getGitSubmodulePath(repoName);
    const newSubmodulePath = getSubmodulePath(repoName);

    // Get relative paths for git commands
    const cwd = process.cwd();
    let repoRoot = '';
    try {
        repoRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8', stdio: 'pipe' }).trim();
    } catch (e) {
        repoRoot = cwd;
    }

    // Remove from git using git-tracked path if it exists
    const pathToRemove = gitTrackedPath || newSubmodulePath;
    if (pathToRemove && fs.existsSync(pathToRemove)) {
        const relativePath = path.relative(repoRoot || cwd, pathToRemove).replace(/\\/g, '/');
        exec(`git submodule deinit -f "${relativePath}"`);
        exec(`git rm -f "${relativePath}"`);

        // Remove directory if it still exists
        if (fs.existsSync(pathToRemove)) {
            fs.rmSync(pathToRemove, { recursive: true, force: true });
        }
    }

    // Also remove from new location if different
    if (gitTrackedPath && newSubmodulePath && gitTrackedPath !== newSubmodulePath && fs.existsSync(newSubmodulePath)) {
        fs.rmSync(newSubmodulePath, { recursive: true, force: true });
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

