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
import { FormGroup, Radio } from 'react-bootstrap';
import { Iterable } from 'immutable';
import ConfirmationDialog from '../../../components/ConfirmationDialog';

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
    }

    componentDidMount() {
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
            onConfirm,
            onCancel,
            onChoice,
            onChoiceCancel,
            serialNumber,
            setupMode
        } = this.props;

        if (choices && (choices.length > 0 || choices.size > 0)) {
            return (
                <ConfirmationDialog
                    isVisible={isVisible}
                    isInProgress={isInProgress}
                    isOkButtonEnabled={!!this.state.selectedChoice}
                    onOk={() => onChoice(this.state.selectedChoice, serialNumber)}
                    onCancel={onChoiceCancel}
                >
                    <p>{text}</p>
                    <FormGroup>
                        {
                            choices.map(choice => (
                                <Radio
                                    key={choice}
                                    name="radioGroup"
                                    disabled={isInProgress}
                                    onClick={() => this.onSelectChoice(choice)}
                                >
                                    {choice}
                                </Radio>
                            ))
                        }
                    </FormGroup>
                </ConfirmationDialog>
            );
        }
        return (
            <ConfirmationDialog
                isVisible={isVisible}
                isInProgress={isInProgress}
                okButtonText={'Yes'}
                cancelButtonText={'No'}
                onOk={() => onConfirm(serialNumber, setupMode)}
                onCancel={onCancel}
                text={text}
            />
        );
    }
}

DeviceSetupDialog.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    isInProgress: PropTypes.bool.isRequired,
    text: PropTypes.string,
    choices: PropTypes.oneOfType([
        PropTypes.instanceOf(Array),
        PropTypes.instanceOf(Iterable),
    ]).isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onChoice: PropTypes.func.isRequired,
    onChoiceCancel: PropTypes.func.isRequired,
    serialNumber: PropTypes.string,
    setupMode: PropTypes.string,
};

DeviceSetupDialog.defaultProps = {
    text: '',
};
