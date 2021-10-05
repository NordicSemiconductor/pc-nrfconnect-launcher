/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ErrorBoundary } from 'pc-nrfconnect-shared';
import { func } from 'prop-types';

import { decorate } from '../../decoration';
import AppReloadDialogContainer from '../containers/AppReloadDialogContainer';
import DeviceSetupContainer from '../containers/DeviceSetupContainer';
import ErrorDialogContainer from '../containers/ErrorDialogContainer';
import FirmwareDialogContainer from '../containers/FirmwareDialogContainer';
import LegacyAppDialogContainer from '../containers/LegacyAppDialogContainer';
import LogViewerContainer from '../containers/LogViewerContainer';
import MainViewContainer from '../containers/MainViewContainer';
import SidePanelContainer from '../containers/SidePanelContainer';
import NavBar from './NavBar';

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
        <ErrorBoundary>
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
            <LegacyAppDialogContainer />
        </ErrorBoundary>
    </div>
);

Root.propTypes = {
    resizeLogContainer: func.isRequired,
};

export default Root;
