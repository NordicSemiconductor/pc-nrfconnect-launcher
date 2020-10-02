/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

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
        const found = result.values.find(
            entry => entry.name === name && entry.value === value
        );
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

function getKeyPart(key, index) {
    const keyParts = key.split('\\');
    if (keyParts.length < index + 1) {
        return null;
    }
    return keyParts[index];
}

// E.g. get the '7&717c78b&0' part from:
// HKLM\SYSTEM\CurrentControlSet\Enum\USB\VID_1366&PID_1015&MI_00\7&717c78b&0&0000\Device Parameters
function parseParentIdPrefix(key) {
    const parentIdIndex = 6;
    const parentId = getKeyPart(key, parentIdIndex);
    if (parentId) {
        const lastAmpersandIndex = parentId.lastIndexOf('&');
        if (lastAmpersandIndex > 0) {
            return parentId.substring(0, lastAmpersandIndex);
        }
    }
    return null;
}

// E.g. get the '000680551615' part from:
// HKLM\SYSTEM\CurrentControlSet\Enum\USB\VID_1366&PID_1015\000680551615
function parseJlinkId(key) {
    const jlinkIdIndex = 6;
    return getKeyPart(key, jlinkIdIndex);
}

export {
    parseVariableLine,
    parseResult,
    parseResults,
    parseParentIdPrefix,
    parseJlinkId,
    parseMatchingKeys,
};
