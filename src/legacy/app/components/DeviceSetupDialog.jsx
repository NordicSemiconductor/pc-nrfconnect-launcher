/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Form from 'react-bootstrap/Form';
import { Iterable } from 'immutable';
import { bool, func, instanceOf, oneOfType, string } from 'prop-types';

import ConfirmationDialog from '../../components/ConfirmationDialog';

/**
 * Dialog that allows the user to provide input that is required during device setup
 * (programming/DFU). If the 'choices' prop is provided, then the user will see a
 * list of choices, and select one of them. If not, then user will just respond yes/no.
 *
 * The 'onConfirm' callback is called with one of the choices or just true if it is a
 * simple yes/no confirmation. Shows a spinner and disables input if the 'isInProgress'
 * prop is set to true.
 */
export default class DeviceSetupDialog extends React.Component {
    constructor(props) {
        super(props);
        this.onSelectChoice = this.onSelectChoice.bind(this);
        this.state = {
            selectedChoice: null,
        };
    }

    onSelectChoice(choice) {
        this.setState({ selectedChoice: choice });
    }

    render() {
        const { isVisible, isInProgress, text, choices, onOk, onCancel } =
            this.props;
        const { selectedChoice } = this.state;

        if (choices && (choices.length > 0 || choices.size > 0)) {
            return (
                <ConfirmationDialog
                    isVisible={isVisible}
                    isInProgress={isInProgress}
                    isOkButtonEnabled={!!selectedChoice}
                    onOk={() => onOk(selectedChoice)}
                    onCancel={onCancel}
                >
                    <p>{text}</p>
                    <Form.Group>
                        {choices.map(choice => (
                            <Form.Check
                                key={choice}
                                name="radioGroup"
                                type="radio"
                                disabled={isInProgress}
                                onClick={() => this.onSelectChoice(choice)}
                                label={choice}
                            />
                        ))}
                    </Form.Group>
                </ConfirmationDialog>
            );
        }
        return (
            <ConfirmationDialog
                isVisible={isVisible}
                isInProgress={isInProgress}
                okButtonText="Yes"
                cancelButtonText="No"
                onOk={() => onOk(true)}
                onCancel={() => onOk(false)}
                text={text}
            />
        );
    }
}

DeviceSetupDialog.propTypes = {
    isVisible: bool.isRequired,
    isInProgress: bool.isRequired,
    text: string,
    choices: oneOfType([instanceOf(Array), instanceOf(Iterable)]).isRequired,
    onOk: func.isRequired,
    onCancel: func.isRequired,
};

DeviceSetupDialog.defaultProps = {
    text: '',
};
