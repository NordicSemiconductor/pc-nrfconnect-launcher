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
import NavBar from './NavBar';
import SidePanelContainer from '../containers/SidePanelContainer';
import LogViewerContainer from '../containers/LogViewerContainer';
import MainViewContainer from '../containers/MainViewContainer';
import FirmwareDialogContainer from '../containers/FirmwareDialogContainer';
import AppReloadDialogContainer from '../containers/AppReloadDialogContainer';
import DeviceSetupContainer from '../containers/DeviceSetupContainer';
import ErrorDialogContainer from '../containers/ErrorDialogContainer';
import { decorate } from '../../decoration';

const DecoratedNavBar = decorate(NavBar, 'NavBar');

function onMouseDownHorizontal(event, resizeLogContainer) {
    event.preventDefault();
    const splitter = document.querySelector('.core-splitter.horizontal');
    const targetNode = document.querySelector('.core-infinite-log');
    const initial = targetNode.offsetHeight + event.clientY;
    const originalMouseMove = document.onmousemove;
    const originalMouseUp = document.onmouseup;
    splitter.draggable = true;
    document.onmousemove = e => {
        e.preventDefault();
        targetNode.style.height = `${initial - e.clientY}px`;
    };
    document.onmouseup = e => {
        e.preventDefault();
        document.onmousemove = originalMouseMove;
        document.onmouseup = originalMouseUp;
        splitter.draggable = false;
        resizeLogContainer(targetNode.offsetHeight);
    };
}

function onMouseDownVertical(event) {
    event.preventDefault();
    const splitter = document.querySelector('.core-splitter.vertical');
    const targetNode = splitter.parentNode.nextSibling;
    const initial = targetNode.offsetWidth + event.clientX;
    const originalMouseMove = document.onmousemove;
    const originalMouseUp = document.onmouseup;
    splitter.draggable = true;
    document.onmousemove = e => {
        e.preventDefault();
        targetNode.style.flexBasis = `${initial - e.clientX}px`;
    };
    document.onmouseup = e => {
        e.preventDefault();
        document.onmousemove = originalMouseMove;
        document.onmouseup = originalMouseUp;
        splitter.draggable = false;
    };
}

const Root = ({ resizeLogContainer }) => (
    <div className="core-main-area">
        <DecoratedNavBar />
        <div className="core-main-layout">
            <div>
                <MainViewContainer />
                <div
                    tabIndex={-1}
                    role="button"
                    className="core-splitter horizontal"
                    onMouseDown={event =>
                        onMouseDownHorizontal(event, resizeLogContainer)
                    }
                />
                <LogViewerContainer />
                <div
                    tabIndex={-1}
                    role="button"
                    className="core-splitter vertical"
                    onMouseDown={onMouseDownVertical}
                />
            </div>
            <SidePanelContainer />
        </div>
        <FirmwareDialogContainer />
        <AppReloadDialogContainer />
        <DeviceSetupContainer />
        <ErrorDialogContainer />
    </div>
);

Root.propTypes = {
    resizeLogContainer: PropTypes.func.isRequired,
};

export default Root;
