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

    it('returns empty map if comName is given, and two serial numbers found in registry, but none are connected', () => {
        const facade = new JlinkFacade();
        facade.registry.findJlinkIds = () =>
            Promise.resolve(['000123456789', '000234567890']);
        facade.nrfjprogjs.getSerialNumbers = callback =>
            callback(null, [345678901]);
        return facade
            .getSerialNumberMap(['COM1'])
            .then(map => expect(map.size).toEqual(0));
    });

    it('emits warning if comName is given, and two serial numbers found in registry, but none are connected', () => {
        const facade = new JlinkFacade();
        facade.registry.findJlinkIds = () =>
            Promise.resolve(['000123456789', '000234567890']);
        facade.nrfjprogjs.getSerialNumbers = callback =>
            callback(null, [345678901]);
        let warningMessage;
        facade.on('warn', message => {
            warningMessage = message;
        });
        return facade.getSerialNumberMap(['COM1']).then(() => {
            expect(warningMessage).toEqual(
                'Found serial numbers 000123456789, 000234567890 for ' +
                    'COM1 in registry, but none of these are connected. Unable to identify serial number.'
            );
        });
    });

    it('rejects if comName is given, and two serial numbers found in registry, but connected devices lookup fails', () => {
        const facade = new JlinkFacade();
        facade.registry.findJlinkIds = () =>
            Promise.resolve(['000123456789', '000234567890']);
        facade.nrfjprogjs.getSerialNumbers = callback =>
            callback(new Error('Lookup failed'));
        return facade
            .getSerialNumberMap(['COM1'])
            .catch(error => expect(error.message).toContain('Lookup failed'));
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

    it('does not call nrfjprogjs if comName is given, and one serial number found in registry', () => {
        const facade = new JlinkFacade();
        facade.registry.findJlinkIds = () => Promise.resolve(['000123456789']);
        facade.nrfjprogjs.getSerialNumbers = jest.fn();
        return facade.getSerialNumberMap(['COM1']).then(() => {
            expect(facade.nrfjprogjs.getSerialNumbers).not.toHaveBeenCalled();
        });
    });

    it('returns map with serial number if comName is given, and two serial numbers found in registry, and one is connected', () => {
        const facade = new JlinkFacade();
        facade.registry.findJlinkIds = () =>
            Promise.resolve(['000123456789', '000987654321']);
        facade.nrfjprogjs.getSerialNumbers = callback =>
            callback(null, [234567890, 123456789]);
        return facade.getSerialNumberMap(['COM1']).then(map => {
            expect(map.size).toEqual(1);
            expect(map.get('COM1')).toEqual('000123456789');
        });
    });

    it('emits warning if comName is given, and two serial numbers found in registry, and one is connected', () => {
        const facade = new JlinkFacade();
        facade.registry.findJlinkIds = () =>
            Promise.resolve(['000123456789', '000987654321']);
        facade.nrfjprogjs.getSerialNumbers = callback =>
            callback(null, [234567890, 123456789]);
        let warningMessage;
        facade.on('warn', message => {
            warningMessage = message;
        });
        return facade.getSerialNumberMap(['COM1']).then(() => {
            expect(warningMessage).toEqual(
                'Found serial numbers 000123456789, 000987654321 for ' +
                    'COM1 in registry. 000123456789 is connected, so using that.'
            );
        });
    });

    it('returns map with serial numbers if multiple comNames are given, and two serial numbers found in registry for each, and one is connected for each', () => {
        const facade = new JlinkFacade();
        facade.registry.findJlinkIds = comName => {
            const serialNumbers = {
                COM1: ['000123456789', '000987654321'],
                COM2: ['000456789012', '000345678901'],
            };
            return Promise.resolve(serialNumbers[comName]);
        };
        facade.nrfjprogjs.getSerialNumbers = callback =>
            callback(null, [345678901, 234567890, 123456789]);
        return facade.getSerialNumberMap(['COM1', 'COM2']).then(map => {
            expect(map.size).toEqual(2);
            expect(map.get('COM1')).toEqual('000123456789');
            expect(map.get('COM2')).toEqual('000345678901');
        });
    });
});
