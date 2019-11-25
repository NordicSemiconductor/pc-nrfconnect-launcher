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

import React, { useRef } from 'react';
import { node } from 'prop-types';

import LogViewer from '../Log/LogViewer';
import { HorizontalSplitter, VerticalSplitter } from './Splitter';

import '../../../resources/css/brand19/shared.scss';
import '../../../resources/css/brand19/app.scss';

const App = ({ children, navBar, sidePanel }) => {
    const sidePanelRef = useRef();
    return (
        <>
            <div className="core19-app">
                {navBar}
                <div className="core19-app-main-and-log">
                    <div>
                        <div className="core19-main-view">{children}</div>
                        <HorizontalSplitter />
                        <LogViewer />
                        <VerticalSplitter targetRef={sidePanelRef} />
                        {/* FIXME: Move VerticalSplitter out one div */}
                    </div>
                    <div ref={sidePanelRef} className="core19-side-panel">
                        {sidePanel}
                    </div>
                </div>
                {/* FIXME <FirmwareDialogContainer />
            <AppReloadDialogContainer />
            <ErrorDialogContainer /> */}
            </div>
        </>
    );
};

App.propTypes = {
    children: node.isRequired,
    navBar: node.isRequired,
    sidePanel: node.isRequired,
};

export default App;
