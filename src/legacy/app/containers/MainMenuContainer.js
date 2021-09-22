/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from '../../decoration';
import * as MainMenuActions from '../actions/mainMenuActions';
import MainMenu from '../components/MainMenu';

function mapStateToProps() {
    return {};
}

function mapDispatchToProps(dispatch) {
    return {
        menuItems: [
            {
                id: 1,
                text: 'Launch other app...',
                hotkey: 'Alt+L',
                onClick: () => dispatch(MainMenuActions.openAppLauncher()),
            },
            {
                id: 2,
                text: 'System report',
                onClick: () => dispatch(MainMenuActions.generateSystemReport()),
            },
            {
                id: 3,
                text: 'About',
                onClick: () => dispatch(MainMenuActions.showAboutDialog()),
            },
        ],
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    MainMenu,
    'MainMenu'
);
