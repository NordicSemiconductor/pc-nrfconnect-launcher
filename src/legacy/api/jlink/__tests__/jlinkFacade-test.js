/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import JlinkFacade from '../jlinkFacade';

describe('JlinkFacade', () => {
    it('returns empty map if empty list of comNames is given', () => {
        const facade = new JlinkFacade();
        return facade
            .getSerialNumberMap([])
            .then(map => expect(map.size).toEqual(0));
    });

    it('returns empty map if comName is given, but no serial numbers found for the comName in registry', () => {
        const facade = new JlinkFacade();
        facade.registry.findJlinkIds = () => Promise.resolve([]);
        return facade
            .getSerialNumberMap(['COM1'])
            .then(map => expect(map.size).toEqual(0));
    });

    it('emits warning if comName is given, but no serial numbers found for the comName in registry', () => {
        const facade = new JlinkFacade();
        facade.registry.findJlinkIds = () => Promise.resolve([]);
        let warningMessage;
        facade.on('warn', message => {
            warningMessage = message;
        });
        return facade
            .getSerialNumberMap(['COM1'])
            .then(() =>
                expect(warningMessage).toContain(
                    'Could not find serial number for COM1'
                )
            );
    });

    it('emits warning if comName is given, but registry lookup fails', () => {
        const facade = new JlinkFacade();
        facade.registry.findJlinkIds = () =>
            Promise.reject(new Error('Lookup failed'));
        let warningMessage;
        facade.on('warn', message => {
            warningMessage = message;
        });
        return facade
            .getSerialNumberMap(['COM1'])
            .then(() => expect(warningMessage).toContain('Lookup failed'));
    });

    it('returns map with serial number if comName is given, and one serial number found in registry', () => {
        const facade = new JlinkFacade();
        facade.registry.findJlinkIds = () => Promise.resolve(['000123456789']);
        return facade.getSerialNumberMap(['COM1']).then(map => {
            expect(map.size).toEqual(1);
            expect(map.get('COM1')).toEqual('000123456789');
        });
    });

    it('does not emit warning if comName is given, and one serial number found in registry', () => {
        const facade = new JlinkFacade();
        facade.registry.findJlinkIds = () => Promise.resolve(['000123456789']);
        let warningMessage;
        facade.on('warn', message => {
            warningMessage = message;
        });
        return facade.getSerialNumberMap(['COM1']).then(() => {
            expect(warningMessage).not.toBeDefined();
        });
    });
});
