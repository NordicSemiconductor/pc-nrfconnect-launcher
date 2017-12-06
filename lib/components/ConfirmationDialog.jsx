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
import PropTypes from 'prop-types';

import { Modal, Button, ModalHeader, ModalFooter, ModalBody, ModalTitle } from 'react-bootstrap';
import Spinner from './Spinner';

const ConfirmationDialog = ({
        isVisible,
        isInProgress,
        title,
        text,
        onOk,
        onCancel,
        okButtonText,
        cancelButtonText,
        linkText,
        linkAddress,
        }) => (
            <div>
                <Modal show={isVisible} onHide={onCancel} backdrop={isInProgress ? 'static' : false}>
                    <ModalHeader closeButton={!isInProgress}>
                        <ModalTitle>{title}</ModalTitle>
                    </ModalHeader>
                    <ModalBody>
                        <p>{text}</p>
                        {
                            linkAddress &&
                            <a href={linkAddress} target="_blank" rel="noopener noreferrer">
                                {linkText || linkAddress} </a>
                        }
                    </ModalBody>
                    <ModalFooter>
                        { isInProgress ? <Spinner /> : null }
                        &nbsp;
                        <Button onClick={onOk} disabled={isInProgress}>{okButtonText}</Button>
                        {
                            onCancel &&
                                <Button onClick={onCancel} disabled={isInProgress}>
                                    {cancelButtonText}
                                </Button>
                        }
                    </ModalFooter>
                </Modal>
            </div>
);

ConfirmationDialog.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    title: PropTypes.string,
    text: PropTypes.string.isRequired,
    linkText: PropTypes.string,
    linkAddress: PropTypes.string,
    onOk: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    okButtonText: PropTypes.string,
    cancelButtonText: PropTypes.string,
    isInProgress: PropTypes.bool,
};

ConfirmationDialog.defaultProps = {
    title: 'Confirm',
    linkText: null,
    linkAddress: null,
    isInProgress: false,
    onCancel: null,
    okButtonText: 'OK',
    cancelButtonText: 'Cancel',
};

export default ConfirmationDialog;
