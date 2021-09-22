/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from '../../decoration';
import SidePanel from '../components/SidePanel';

function mapStateToProps() {
    return {};
}

function mapDispatchToProps() {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(
    SidePanel,
    'SidePanel'
);
