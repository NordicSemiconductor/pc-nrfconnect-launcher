/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import {
    ConfirmationDialog,
    useFocusedOnVisible,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { isLegacyUrl } from '../../../common/legacySource';
import { useLauncherDispatch, useLauncherSelector } from '../../util/hooks';
import { addSource } from './sourcesEffects';
import {
    getIsAddSourceVisible,
    hideAddSource,
    warnAddLegacySource,
} from './sourcesSlice';

export default () => {
    const dispatch = useLauncherDispatch();
    const isVisible = useLauncherSelector(getIsAddSourceVisible);
    const [url, setUrl] = useState('');

    const ref = useFocusedOnVisible<HTMLInputElement>(isVisible);

    const cancel = () => dispatch(hideAddSource());

    const maybeAddSource = () => {
        const effectiveUrl = url.trim();

        if (isLegacyUrl(effectiveUrl)) {
            dispatch(warnAddLegacySource(effectiveUrl));
            dispatch(hideAddSource());
            setUrl('');
        } else if (effectiveUrl.length > 0) {
            dispatch(hideAddSource());
            setUrl('');
            dispatch(addSource(effectiveUrl));
        }
    };

    return (
        <ConfirmationDialog
            isVisible={isVisible}
            title="Add source"
            confirmLabel="Add"
            onConfirm={maybeAddSource}
            onCancel={cancel}
        >
            <p>
                Enter the URL of a source&rsquo;s <code>source.json</code> file:
            </p>
            <Form onSubmit={maybeAddSource}>
                <Form.Control
                    ref={ref}
                    value={url}
                    onChange={event => setUrl(event.target.value)}
                />
            </Form>
        </ConfirmationDialog>
    );
};
