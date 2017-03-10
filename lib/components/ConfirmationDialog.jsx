import React, { PropTypes } from 'react';

import { Modal, Button, ModalHeader, ModalFooter, ModalBody, ModalTitle } from 'react-bootstrap';
import Spinner from './Spinner';

const ConfirmationDialog = ({ isVisible, isInProgress, text, onOk, onCancel }) => (
    <div>
        <Modal show={isVisible} onHide={onCancel} backdrop={isInProgress ? 'static' : false}>
            <ModalHeader closeButton={!isInProgress}>
                <ModalTitle>Confirm</ModalTitle>
            </ModalHeader>
            <ModalBody>
                <p>{text}</p>
            </ModalBody>
            <ModalFooter>
                { isInProgress ? <Spinner /> : null }
                &nbsp;
                <Button onClick={onOk} disabled={isInProgress}>OK</Button>
                <Button onClick={onCancel} disabled={isInProgress}>Cancel</Button>
            </ModalFooter>
        </Modal>
    </div>
);

ConfirmationDialog.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired,
    onOk: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isInProgress: PropTypes.bool,
};

ConfirmationDialog.defaultProps = {
    isInProgress: false,
};

export default ConfirmationDialog;
