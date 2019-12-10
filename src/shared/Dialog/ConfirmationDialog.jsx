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

import React from 'react';
import {
    arrayOf, bool, func, node, oneOfType, string,
} from 'prop-types';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from './Spinner';

/**
 * Generic dialog that asks the user to confirm something. The dialog content
 * and button actions can be customized.
 *
 * @param {boolean} isVisible Show the dialog or not.
 * @param {boolean} [isInProgress] Shows a spinner if true.
 * @param {string} [title] The dialog title.
 * @param {Array|*} [children] Array or React element to render in the dialog.
 * @param {string} [text] Text to render in the dialog. Alternative to `children`.
 * @param {function} onOk Invoked when the user clicks OK.
 * @param {function} [onCancel] Invoked when the user cancels. Not showing cancel button if
 *                              this is not provided.
 * @param {string} [okButtonText] Label text for the OK button. Default: "OK".
 * @param {string} [cancelButtonText] Label text for the cancel button. Default: "Cancel".
 * @param {boolean} [isOkButtonEnabled] Enable the OK button or not. Default: true.
 * @param {string} [buttonCssClass] CSS class name for the buttons. Default: "core-btn".
 * @returns {*} React element to be rendered.
 */
const ConfirmationDialog = ({
    isVisible,
    isInProgress,
    title,
    children,
    text,
    onOk,
    onCancel,
    okButtonText,
    cancelButtonText,
    isOkButtonEnabled,
}) => (
    <Modal show={isVisible} onHide={onCancel} backdrop={isInProgress ? 'static' : false}>
        <Modal.Header closeButton={!isInProgress}>
            <Modal.Title data-testid="title">{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            { children || <p data-testid="body">{ text }</p> }
        </Modal.Body>
        <Modal.Footer>
            { isInProgress ? <Spinner /> : null }

            &nbsp;
            <Button
                variant="primary"
                onClick={onOk}
                disabled={!isOkButtonEnabled || isInProgress}
            >
                {okButtonText}
            </Button>
            <Button
                onClick={onCancel}
                disabled={isInProgress}
            >
                {cancelButtonText}
            </Button>
        </Modal.Footer>
    </Modal>
);

ConfirmationDialog.propTypes = {
    isVisible: bool.isRequired,
    title: string,
    text: string,
    children: oneOfType([
        arrayOf(node),
        node,
    ]),
    onOk: func.isRequired,
    onCancel: func.isRequired,
    okButtonText: string,
    cancelButtonText: string,
    isInProgress: bool,
    isOkButtonEnabled: bool,
};

ConfirmationDialog.defaultProps = {
    title: 'Confirm',
    text: null,
    children: null,
    isInProgress: false,
    isOkButtonEnabled: true,
    okButtonText: 'OK',
    cancelButtonText: 'Cancel',
};

export default ConfirmationDialog;
