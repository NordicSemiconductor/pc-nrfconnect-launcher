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

import DeviceLister from 'nrf-device-lister';

import React from 'react';
// import PropTypes from 'prop-types';

import DeviceSelector from '../components/DeviceSelector';
import { connect, getAppConfig } from '../../../util/apps';
import { logger } from '../../../api/logging';
import * as DeviceActions from '../actions/deviceActions';


class DeviceSelectorContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            devices: [],
        };
    }

    componentDidMount() {
        const config = getAppConfig();

        console.log('Instantiating device lister for traits: ', config.selectorTraits);
        this.deviceLister = new DeviceLister(config.selectorTraits);

        this.deviceLister.on('conflated', devices => {
            this.setState(prev =>
//    logger.info(`Changes in available devices. Now ${Array.from(devices).length} devices.`);
                 ({ ...prev, devices }));
        });

        this.deviceLister.on('error', err => {
            console.error(err);

            if (err.usb) {
                const usbAddr = `${err.usb.busNumber}.${err.usb.deviceAddress}`;

                let message = `Error while probing usb device at bus.address ${usbAddr}: ${err.message}. `;
                if (process.platform === 'linux') {
                    message += 'Please check your udev rules concerning permissions for USB devices, see ' +
                        'https://github.com/NordicSemiconductor/nrf-udev';
                } else if (process.platform === 'win32') {
                    message += 'Please check that a libusb-compatible kernel driver is bound to this device.';
                }

                logger.error(message);
            } else {
                logger.error(`Error while probing devices: ${err.message}`);
            }
        });

        this.deviceLister.start();
    }

    componentWillUnmount() {
        this.deviceLister.stop();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.watch && !this.state.watch) {
            console.log('Stopping device-lister');
            this.deviceLister.stop();
        } else if (prevState.watch && !this.state.watch) {
            console.log('Re-starting device-lister');
            this.deviceLister.start();
        }
    }


    /*
     * Called from the templated selector.
     * Shall receive a device definition.
     * Resets the internal state, and calls the downstream onSelect().
     * Note that this.onSelect() is different from this.props.onSelect(),
     * the later one is the one that actually triggers the action.
     */
//     onSelect(device) {
//         if (this.state.selectDevice) {
//             this.onDeselect();
//         }
// //                 logger.info(`Selecting device with s/n ${device.serialNumber}`);
//         this.setState(prev => ({ ...prev, selectedSerialNumber: device.serialNumber }));
//         this.props.onSelect(device);
//     }

    /*
     * Called from the templated selector.
     * Resets the internal state, and calls the downstream onDeselect().
     * Note that this.onDeselect() is different from this.props.onDeselect(),
     * the later one is the one that actually triggers the action.
     */
//     onDeselect() {
// //                 logger.info('Deselecting device');
//         this.setState(prev => ({ ...prev, selectedSerialNumber: undefined }));
//         this.props.onDeselect();
//     }


    /*
     * Returns the JSX corresponding to a drop-down menu.
     * Prepares some properties for the template, uses it.
     */
    render() {
//         const displayCloseItem = Boolean(this.state.selectedSerialNumber);
        const devices = Array.from(this.state.devices);
//         const devices = this.state.devices;

        const templateProps = {
            ...this.props,
//             togglerText,
//             displayCloseItem,
            devices,
//             selectedSerialNumber: this.props.selectedSerialNumber,
//             onSelect: this.props.onSelect,
//             onDeselect: this.props.onDeselect,
        };

        return (
            <DeviceSelector {...templateProps} />
        );
    }
}

// DeviceSelectorContainer.propTypes = {
//     onSelect: PropTypes.func.isRequired,
//     onDeselect: PropTypes.func.isRequired,
//     traits: PropTypes.shape({}),
// };
//
// DeviceSelectorContainer.defaultProps = {
//     traits: undefined,
// };


function mapStateToProps(state) {
    const { device } = state.core;
// console.log(device);
    return {
//         devices: device.devices,
        selectedSerialNumber: device.selectedSerialNumber,
        watch: device.watch,
    };
}

function mapDispatchToProps(dispatch) {
    return {
//         onMount: () => dispatch(DeviceActions.startWatchingDevices()),
//         onUnmount: () => dispatch(DeviceActions.stopWatchingDevices()),
        onSelect: device => dispatch(DeviceActions.selectDevice(device)),
        onDeselect: () => dispatch(DeviceActions.deselectDevice()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(DeviceSelectorContainer, 'DeviceSelectorContainer');
