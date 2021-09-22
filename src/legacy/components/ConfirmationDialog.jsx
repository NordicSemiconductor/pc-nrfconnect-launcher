/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { arrayOf, bool, func, node, oneOfType, string } from 'prop-types';

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
    dimBackground,
}) => (
    <Modal
        show={isVisible}
        onHide={onCancel}
        backdrop={isInProgress || dimBackground ? 'static' : false}
    >
        <Modal.Header closeButton={!isInProgress}>
            <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{children || <p>{text}</p>}</Modal.Body>
        <Modal.Footer>
            {isInProgress ? <Spinner /> : null}
            &nbsp;
            <Button
                variant="primary"
                className="core-btn"
                onClick={onOk}
                disabled={!isOkButtonEnabled || isInProgress}
            >
                {okButtonText}
            </Button>
            {onCancel && (
                <Button
                    className="core-btn"
                    onClick={onCancel}
                    disabled={isInProgress}
                >
                    {cancelButtonText}
                </Button>
            )}
        </Modal.Footer>
    </Modal>
);

ConfirmationDialog.propTypes = {
    isVisible: bool.isRequired,
    title: string,
    text: string,
    children: oneOfType([arrayOf(node), node]),
    onOk: func.isRequired,
    onCancel: func,
    okButtonText: string,
    cancelButtonText: string,
    isInProgress: bool,
    isOkButtonEnabled: bool,
    dimBackground: bool,
};

ConfirmationDialog.defaultProps = {
    title: 'Confirm',
    text: null,
    children: null,
    isInProgress: false,
    isOkButtonEnabled: true,
    onCancel: null,
    okButtonText: 'OK',
    cancelButtonText: 'Cancel',
    dimBackground: false,
};

export default ConfirmationDialog;
