import reducer from '../adapterReducer';
import * as AdapterActions from '../../actions/adapterActions';

const SEGGER_VENDOR_ID = '0x1366';
const initialState = reducer(undefined, {});

describe('adapterReducer', () => {
    it('should set loading state when loading adapters', () => {
        const state = reducer(initialState, {
            type: AdapterActions.ADAPTERS_LOAD,
        });
        expect(state.isLoading).toEqual(true);
    });

    it('should remove loading state when loading adapters has failed', () => {
        const stateBefore = initialState.set('isLoading', true);
        const state = reducer(stateBefore, {
            type: AdapterActions.ADAPTERS_LOAD_ERROR,
        });
        expect(state.isLoading).toEqual(false);
    });

    it('should remove loading state when loading adapters has succeeded', () => {
        const stateBefore = initialState.set('isLoading', true);
        const state = reducer(stateBefore, {
            type: AdapterActions.ADAPTERS_LOAD_SUCCESS,
            serialPorts: [],
        });
        expect(state.isLoading).toEqual(false);
    });

    it('should add segger adapters to state when loading adapters has succeeded', () => {
        const unknownVendorPort = {
            comName: '/dev/tty1',
            vendorId: '0x01',
        };
        const seggerPort = {
            comName: '/dev/tty2',
            vendorId: SEGGER_VENDOR_ID,
        };

        const state = reducer(initialState, {
            type: AdapterActions.ADAPTERS_LOAD_SUCCESS,
            serialPorts: [unknownVendorPort, seggerPort],
        });

        expect(state.adapters.size).toEqual(1);
        expect(state.adapters.first().comName).toEqual(seggerPort.comName);
    });

    it('should add port metadata to state when loading adapters has succeeded', () => {
        const seggerPort = {
            comName: '/dev/tty1',
            vendorId: SEGGER_VENDOR_ID,
            manufacturer: 'SEGGER',
            serialNumber: 'SEGGER_J-Link_000680551615',
            productId: '0x0105',
        };

        const state = reducer(initialState, {
            type: AdapterActions.ADAPTERS_LOAD_SUCCESS,
            serialPorts: [seggerPort],
        });

        expect(state.adapters.first().toJS()).toEqual({
            comName: '/dev/tty1',
            vendorId: SEGGER_VENDOR_ID,
            manufacturer: 'SEGGER',
            serialNumber: '680551615',
            productId: '0x0105',
        });
    });

    it('should set selected adapter comPort when adapter has been selected', () => {
        const state = reducer(initialState, {
            type: AdapterActions.ADAPTER_SELECTED,
            serialPort: {
                comName: '/dev/tty1',
            },
        });
        expect(state.selectedAdapter).toEqual('/dev/tty1');
    });

    it('should reset selected adapter when adapter has been deselected', () => {
        const stateBefore = initialState.set('selectedAdapter', '/dev/tty1');
        const state = reducer(stateBefore, {
            type: AdapterActions.ADAPTER_DESELECTED,
        });
        expect(state.selectedAdapter).toEqual(initialState.selectedAdapter);
    });
});
