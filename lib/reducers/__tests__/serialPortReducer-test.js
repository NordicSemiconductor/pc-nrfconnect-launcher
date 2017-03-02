import reducer from '../serialPortReducer';
import * as SerialPortActions from '../../actions/serialPortActions';

const SEGGER_VENDOR_ID = '0x1366';
const initialState = reducer(undefined, {});

describe('serialPortReducer', () => {
    it('should set loading state when loading ports', () => {
        const state = reducer(initialState, {
            type: SerialPortActions.SERIAL_PORTS_LOAD,
        });
        expect(state.isLoading).toEqual(true);
    });

    it('should remove loading state when loading ports has failed', () => {
        const stateBefore = initialState.set('isLoading', true);
        const state = reducer(stateBefore, {
            type: SerialPortActions.SERIAL_PORTS_LOAD_ERROR,
        });
        expect(state.isLoading).toEqual(false);
    });

    it('should remove loading state when loading ports has succeeded', () => {
        const stateBefore = initialState.set('isLoading', true);
        const state = reducer(stateBefore, {
            type: SerialPortActions.SERIAL_PORTS_LOAD_SUCCESS,
            ports: [],
        });
        expect(state.isLoading).toEqual(false);
    });

    it('should add segger ports to state when loading ports has succeeded', () => {
        const unknownVendorPort = {
            comName: '/dev/tty1',
            vendorId: '0x01',
        };
        const seggerPort = {
            comName: '/dev/tty2',
            vendorId: SEGGER_VENDOR_ID,
        };

        const state = reducer(initialState, {
            type: SerialPortActions.SERIAL_PORTS_LOAD_SUCCESS,
            ports: [unknownVendorPort, seggerPort],
        });

        expect(state.ports.size).toEqual(1);
        expect(state.ports.first().comName).toEqual(seggerPort.comName);
    });

    it('should add port metadata to state when loading ports has succeeded', () => {
        const seggerPort = {
            comName: '/dev/tty1',
            vendorId: SEGGER_VENDOR_ID,
            manufacturer: 'SEGGER',
            serialNumber: 'SEGGER_J-Link_000680551615',
            productId: '0x0105',
        };

        const state = reducer(initialState, {
            type: SerialPortActions.SERIAL_PORTS_LOAD_SUCCESS,
            ports: [seggerPort],
        });

        expect(state.ports.first().toJS()).toEqual({
            comName: '/dev/tty1',
            vendorId: SEGGER_VENDOR_ID,
            manufacturer: 'SEGGER',
            serialNumber: '680551615',
            productId: '0x0105',
        });
    });

    it('should remove leading zeroes in serial number when adding port to state', () => {
        const seggerPort = {
            vendorId: SEGGER_VENDOR_ID,
            serialNumber: '000680551615',
        };

        const state = reducer(initialState, {
            type: SerialPortActions.SERIAL_PORTS_LOAD_SUCCESS,
            ports: [seggerPort],
        });

        const port = state.ports.first().toJS();
        expect(port.serialNumber).toEqual('680551615');
    });

    it('should set selected port comPort when port has been selected', () => {
        const state = reducer(initialState, {
            type: SerialPortActions.SERIAL_PORT_SELECTED,
            port: {
                comName: '/dev/tty1',
            },
        });
        expect(state.selectedPort).toEqual('/dev/tty1');
    });

    it('should reset selected port when port has been deselected', () => {
        const stateBefore = initialState.set('selectedPort', '/dev/tty1');
        const state = reducer(stateBefore, {
            type: SerialPortActions.SERIAL_PORT_DESELECTED,
        });
        expect(state.selectedPort).toEqual(initialState.selectedPort);
    });
});
