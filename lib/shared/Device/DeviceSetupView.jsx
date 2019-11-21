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
    arrayOf, bool, func, string,
} from 'prop-types';
import Form from 'react-bootstrap/Form';
import ConfirmationDialog from '../Dialog/ConfirmationDialog';

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
        const {
            isVisible,
            isInProgress,
            text,
            choices,
            onOk,
            onCancel,
        } = this.props;
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
                        {
                            choices.map(choice => (
                                <Form.Check
                                    key={choice}
                                    name="radioGroup"
                                    type="radio"
                                    disabled={isInProgress}
                                    onClick={() => this.onSelectChoice(choice)}
                                    label={choice}
                                />
                            ))
                        }
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
    choices: arrayOf(string).isRequired,
    onOk: func.isRequired,
    onCancel: func.isRequired,
};

DeviceSetupDialog.defaultProps = {
    text: '',
};
