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
 * Prefers new path (doc/docs/submodules/...) over old path (doc/submodules/...)
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
    const foundPaths = []; // Collect all paths, prefer new one

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
                foundPaths.push(actualPath);
                // Prefer new path structure
                if (actualPath.includes('docs/submodules')) {
                    return path.resolve(__dirname, '..', actualPath);
                }
            }
        } else if (trimmed.startsWith('[') && inSubmodule) {
            // Hit next section, stop looking
            break;
        }
    }

    // If we found paths but none were new structure, return the last one found
    // Otherwise fallback to section name
    if (foundPaths.length > 0) {
        return path.resolve(__dirname, '..', foundPaths[foundPaths.length - 1]);
    }

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

    const docsPath = path.join(docPath, 'docs');
    const mkdocsPath = path.join(docPath, 'mkdocs.yml');
    const finalDocPath = path.join(submodulePath, 'doc');
    const finalMkdocsPath = path.join(submodulePath, 'mkdocs.yml');

    // Structure: sparse checkout gives us doc/docs/ (sources) and doc/mkdocs.yml
    // We want: doc/ (sources) and mkdocs.yml at root

    // Step 1: Move contents of doc/docs/ to doc/ (flatten structure)
    if (fs.existsSync(docsPath)) {
        const docsFiles = fs.readdirSync(docsPath);

        // Move each file/directory from docs/ to doc/
        for (const file of docsFiles) {
            const src = path.join(docsPath, file);
            const dest = path.join(docPath, file);

            // Skip if destination already exists (shouldn't happen, but be safe)
            if (fs.existsSync(dest)) {
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
                    fs.rmdirSync(src);
                } else {
                    fs.unlinkSync(dest);
                    fs.renameSync(src, dest);
                }
            } else {
                fs.renameSync(src, dest);
            }
        }

        // Remove empty docs/ directory
        try {
            fs.rmdirSync(docsPath);
        } catch (error) {
            // Directory might not be empty, that's okay
        }
    }

    // Step 2: Move mkdocs.yml to submodule root
    if (fs.existsSync(mkdocsPath)) {
        if (fs.existsSync(finalMkdocsPath)) {
            fs.unlinkSync(finalMkdocsPath);
        }
        fs.renameSync(mkdocsPath, finalMkdocsPath);
    }

    // Step 3: Clean up - remove zoomin/ if it exists (we don't need it)
    const zoominPath = path.join(docPath, 'zoomin');
    if (fs.existsSync(zoominPath)) {
        fs.rmSync(zoominPath, { recursive: true, force: true });
    }

    // Final structure should be:
    // submodules/<app_name>/
    //   doc/
    //     (source files)
    //   mkdocs.yml
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

    // Try to get the actual git-tracked path by querying git directly first
    // This is the most reliable way to know what git actually knows about
    let pathForGit = null;
    try {
        const gitStatus = execSync('git submodule status', { encoding: 'utf8', stdio: 'pipe' });
        const statusLines = gitStatus.split('\n');
        for (const statusLine of statusLines) {
            // Format: " abc1234 path/to/submodule (tag)" or "-abc1234 path/to/submodule (tag)"
            const pathMatch = statusLine.match(/[\s-]+\S+\s+(\S+)/);
            if (pathMatch) {
                const submodulePathFromGit = pathMatch[1];
                // Check if this path ends with our repo name
                if (submodulePathFromGit.endsWith(repoName) ||
                    submodulePathFromGit.includes(`/${repoName}`) ||
                    submodulePathFromGit.includes(`\\${repoName}`)) {
                    pathForGit = path.resolve(repoRoot || cwd, submodulePathFromGit);
                    break;
                }
            }
        }
    } catch (e) {
        // If git submodule status fails, we'll use gitTrackedPath from .gitmodules
    }

    // Fallback to gitTrackedPath from .gitmodules if git status didn't find it
    if (!pathForGit) {
        pathForGit = gitTrackedPath;
    }

    // Check if submodule exists at any known location
    const existsAtOldPath = gitTrackedPath && fs.existsSync(gitTrackedPath);
    const existsAtNewPath = fs.existsSync(newSubmodulePath);
    const existsAtGitPath = pathForGit && fs.existsSync(pathForGit);

    if (existsAtOldPath || existsAtNewPath || existsAtGitPath || pathForGit) {
        console.log(`Submodule ${repoName} already exists, updating...`);

        // Use git-tracked path for git operations - MUST use what git knows about
        // Prefer path from git submodule status, then gitTrackedPath, then new path
        if (!pathForGit) {
            // Last resort: use new path (might fail if git doesn't know about it)
            pathForGit = newSubmodulePath;
        }

        const relativePathForGit = path.relative(repoRoot || cwd, pathForGit).replace(/\\/g, '/');

        // Try to update using git-tracked path
        try {
            exec(`git submodule update --init --recursive "${relativePathForGit}"`);
        } catch (error) {
            // If that fails, try alternative paths
            const alternatives = [];
            if (gitTrackedPath && gitTrackedPath !== pathForGit) {
                alternatives.push(gitTrackedPath);
            }
            if (newSubmodulePath !== pathForGit && newSubmodulePath !== gitTrackedPath) {
                alternatives.push(newSubmodulePath);
            }

            let succeeded = false;
            for (const altPath of alternatives) {
                try {
                    const altRelativePath = path.relative(repoRoot || cwd, altPath).replace(/\\/g, '/');
                    console.log(`Retrying with alternative path: ${altRelativePath}`);
                    exec(`git submodule update --init --recursive "${altRelativePath}"`);
                    pathForGit = altPath;
                    succeeded = true;
                    break;
                } catch (altError) {
                    // Try next alternative
                }
            }

            if (!succeeded) {
                throw error;
            }
        }

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

