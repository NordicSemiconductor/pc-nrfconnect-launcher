#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DOC_DIR = path.join(__dirname, '..', 'doc');
const MAIN_MKDOCS = path.join(DOC_DIR, 'mkdocs.yml');
const RESOLVED_MKDOCS = path.join(DOC_DIR, 'mkdocs.resolved.yml');

/**
 * Extract nav section from mkdocs.yml content
 */
function extractNavSection(content) {
    const lines = content.split('\n');
    const navStart = lines.findIndex(line => line.trim() === 'nav:');
    if (navStart === -1) {
        return null;
    }

    // Extract nav section - find where it ends (next top-level key or end of file)
    const navLines = [lines[navStart]];
    const baseIndent = lines[navStart].match(/^(\s*)/)[1].length;

    for (let i = navStart + 1; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip empty lines and comments
        if (!trimmed || trimmed.startsWith('#')) {
            navLines.push(line);
            continue;
        }

        // Check if we've hit the next top-level key (same or less indentation)
        const currentIndent = line.match(/^(\s*)/)[1].length;
        if (currentIndent <= baseIndent && trimmed && !trimmed.startsWith('-')) {
            break;
        }

        navLines.push(line);
    }

    return navLines.join('\n');
}

/**
 * Parse included mkdocs.yml and extract nav section
 */
function parseIncludedMkdocs(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`Warning: Included file not found: ${filePath}`);
        return null;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const navSection = extractNavSection(content);

    if (!navSection) {
        console.error(`Warning: No nav section found in ${filePath}`);
        return null;
    }

    return navSection;
}

/**
 * Adjust paths in nav section to be relative to submodules/<app_name>/docs/
 */
function adjustNavPaths(navContent, appName) {
    const lines = navContent.split('\n');
    const adjusted = [];

    for (const line of lines) {
        // Match navigation items like "  - Title: filename.md" or "    - Title: filename.md"
        // Also handle quoted strings: "  - Title: 'filename.md'"
        const match = line.match(/^(\s*-\s+)([^:]+):\s*(.+)$/);
        if (match) {
            const indent = match[1];
            const title = match[2].trim();
            let pathPart = match[3].trim();

            // Remove quotes if present
            if ((pathPart.startsWith("'") && pathPart.endsWith("'")) ||
                (pathPart.startsWith('"') && pathPart.endsWith('"'))) {
                pathPart = pathPart.slice(1, -1);
            }

            // Skip if already has submodules/ prefix or is an include statement
            if (pathPart.startsWith('submodules/') || pathPart.startsWith('!include')) {
                adjusted.push(line);
                continue;
            }

            // Adjust path - ensure it's relative to submodules/<app_name>/docs/
            const newPath = `submodules/${appName}/docs/${pathPart}`;
            adjusted.push(`${indent}${title}: ${newPath}`);
        } else {
            adjusted.push(line);
        }
    }

    return adjusted.join('\n');
}

/**
 * Resolve !include statements in mkdocs.yml
 */
function resolveIncludes() {
    console.log('Resolving !include statements in mkdocs.yml...');

    if (!fs.existsSync(MAIN_MKDOCS)) {
        console.error(`Error: Main mkdocs.yml not found at ${MAIN_MKDOCS}`);
        process.exit(1);
    }

    const content = fs.readFileSync(MAIN_MKDOCS, 'utf8');
    const lines = content.split('\n');
    const resolved = [];

    // Pattern to match !include statements: "  - Title: '!include ./submodules/app-name/mkdocs.yml'"
    const includePattern = /^\s*-\s+([^:]+):\s*['"]!include\s+(.+?)['"]\s*$/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(includePattern);

        if (match) {
            const title = match[1].trim();
            const includePath = match[2].trim();

            // Resolve the include path relative to doc directory
            // Handle both old paths (./submodules/...) and new paths (./docs/submodules/...)
            let resolvedPath = path.resolve(DOC_DIR, includePath);

            // Extract app name from path
            // Pattern: ./submodules/pc-nrfconnect-quickstart/mkdocs.yml or ./docs/submodules/pc-nrfconnect-quickstart/mkdocs.yml
            const appNameMatch = includePath.match(/(?:docs\/)?submodules[\/\\]([^\/\\]+)/);
            if (!appNameMatch) {
                console.warn(`Warning: Could not extract app name from ${includePath}, skipping`);
                resolved.push(line);
                continue;
            }

            const appName = appNameMatch[1];

            // Try new path first (docs/submodules/...), then fall back to old path (submodules/...)
            const newPath = path.join(DOC_DIR, 'docs', 'submodules', appName, 'mkdocs.yml');
            const oldPath = path.join(DOC_DIR, 'submodules', appName, 'mkdocs.yml');

            if (fs.existsSync(newPath)) {
                resolvedPath = newPath;
            } else if (fs.existsSync(oldPath)) {
                resolvedPath = oldPath;
            }
            console.log(`  Resolving ${title}: ${includePath} (app: ${appName})`);

            // Parse the included mkdocs.yml
            const includedNav = parseIncludedMkdocs(resolvedPath);
            if (!includedNav) {
                console.warn(`Warning: Could not parse nav from ${resolvedPath}, keeping original include`);
                resolved.push(line);
                continue;
            }

            // Adjust paths in the included nav
            const adjustedNav = adjustNavPaths(includedNav, appName);

            // Replace the include line with the resolved navigation
            // Extract the indent level
            const indent = line.match(/^(\s*)/)[1];
            const navLines = adjustedNav.split('\n');

            // Skip the "nav:" line and process the actual nav items
            let foundNavItems = false;
            for (let j = 0; j < navLines.length; j++) {
                const navLine = navLines[j];
                const trimmed = navLine.trim();

                // Skip the "nav:" header line
                if (trimmed === 'nav:') {
                    continue;
                }

                // Process nav items
                if (trimmed.startsWith('-')) {
                    if (!foundNavItems) {
                        // First nav item - add title
                        resolved.push(`${indent}- ${title}:`);
                        foundNavItems = true;
                    }
                    // Add nav item with proper indentation (one level deeper than title)
                    const itemIndent = navLine.match(/^(\s*)/)[1];
                    // Remove the original indent and add our indent + 2 spaces
                    const navContent = navLine.substring(itemIndent.length);
                    resolved.push(indent + '  ' + navContent);
                } else if (trimmed && foundNavItems) {
                    // Continuation of nav structure
                    const itemIndent = navLine.match(/^(\s*)/)[1];
                    const navContent = navLine.substring(itemIndent.length);
                    resolved.push(indent + '  ' + navContent);
                }
            }

            if (!foundNavItems) {
                console.warn(`Warning: No nav items found in ${resolvedPath}, keeping original include`);
                resolved.push(line);
            }
        } else {
            resolved.push(line);
        }
    }

    // Write resolved mkdocs.yml
    const resolvedContent = resolved.join('\n');
    fs.writeFileSync(RESOLVED_MKDOCS, resolvedContent, 'utf8');

    console.log(`✓ Resolved mkdocs.yml written to ${RESOLVED_MKDOCS}`);
}

// Run if called directly
if (require.main === module) {
    resolveIncludes();
}

module.exports = { resolveIncludes, RESOLVED_MKDOCS };

