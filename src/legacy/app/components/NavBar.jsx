/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { string } from 'prop-types';

import Logo from '../../components/Logo';
import { decorate, getAppConfig } from '../../decoration';
import DeviceSelectorContainer from '../containers/DeviceSelectorContainer';
import MainMenuContainer from '../containers/MainMenuContainer';
import NavMenuContainer from '../containers/NavMenuContainer';
import SerialPortSelectorContainer from '../containers/SerialPortSelectorContainer';

const DecoratedLogo = decorate(Logo, 'Logo');

function NavBar({ cssClass, navSectionCssClass }) {
    const appConfig = getAppConfig();
    return (
        <div className={cssClass}>
            <MainMenuContainer />
            <div className={navSectionCssClass}>
                {appConfig.selectorTraits ? (
                    <DeviceSelectorContainer
                        traits={appConfig.selectorTraits}
                    />
                ) : (
                    <SerialPortSelectorContainer />
                )}
            </div>
            <NavMenuContainer />
            <DecoratedLogo />
        </div>
    );
}

NavBar.propTypes = {
    cssClass: string,
    navSectionCssClass: string,
};

NavBar.defaultProps = {
    cssClass: 'core-nav-bar',
    navSectionCssClass: 'core-nav-section core-padded-row',
};

export default NavBar;
