const KEY_PATTERN = /^(HKEY_LOCAL_MACHINE|HKEY_CURRENT_USER|HKEY_CLASSES_ROOT|HKEY_USERS|HKEY_CURRENT_CONFIG)(.*)$/;

function parseVariableLine(line) {
    const lineParts = line.trim().split(/\s+/);
    if (lineParts.length === 3 && lineParts[1] === 'REG_SZ') {
        return {
            name: lineParts[0],
            value: lineParts[2],
        };
    }
    return {};
}

function removeEmptyLines(lines) {
    return lines.reduce((prev, curr) => {
        if (curr !== '') {
            return prev.concat(curr);
        }
        return prev;
    }, []);
}

function parseResult(resultString) {
    const resultLines = removeEmptyLines(resultString.split(/\r\n|\r|\n/));
    if (resultLines.length > 1 && KEY_PATTERN.test(resultLines[0])) {
        const variableLines = resultLines.slice(1);
        return {
            key: resultLines[0],
            values: variableLines
                .map(line => parseVariableLine(line))
                .filter(values => Object.keys(values).length > 0),
        };
    }
    return {};
}

function parseResults(regOutput) {
    const resultStrings = regOutput.split(/\r\n\r\n|\r\r|\n\n/);
    return resultStrings
        .map(resultString => parseResult(resultString))
        .filter(result => !!result.key);
}

function hasValue(result, name, value) {
    if (result.values) {
        const found = result.values.find(entry => (
            entry.name === name && entry.value === value
        ));
        if (found) {
            return true;
        }
    }
    return false;
}

function parseMatchingKeys(regOutput, name, value) {
    return parseResults(regOutput)
        .filter(result => hasValue(result, name, value))
        .map(result => result.key);
}

// E.g. get the '7&717c78b&0' part from:
// HKLM\SYSTEM\CurrentControlSet\Enum\USB\VID_1366&PID_1015&MI_00\7&717c78b&0&0000\Device Parameters
function parseParentIdPrefix(key) {
    const keyParts = key.split('\\');
    if (keyParts.length < 7) {
        return null;
    }
    const lastAmpersandIndex = keyParts[6].lastIndexOf('&');
    if (lastAmpersandIndex) {
        return keyParts[6].substring(0, lastAmpersandIndex);
    }
    return null;
}

// E.g. get the '000680551615' part from:
// HKLM\SYSTEM\CurrentControlSet\Enum\USB\VID_1366&PID_1015\000680551615
function parseJlinkId(key) {
    const keyParts = key.split('\\');
    if (keyParts.length < 7) {
        return null;
    }
    return keyParts[6];
}

export default {
    parseVariableLine,
    parseResult,
    parseResults,
    parseParentIdPrefix,
    parseJlinkId,
    parseMatchingKeys,
};
