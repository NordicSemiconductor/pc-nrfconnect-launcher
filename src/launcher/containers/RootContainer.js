/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Provider } from 'react-redux';
import { object } from 'prop-types';

import Root from '../components/Root';

const RootContainer = ({ store }) =>
    React.createElement(Provider, { store }, React.createElement(Root));

RootContainer.propTypes = {
    store: object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default RootContainer;
