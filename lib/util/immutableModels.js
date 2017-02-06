import { Record } from 'immutable';

const ImmutableAdapter = Record({
    comName: null,
    serialNumber: null,
    manufacturer: null,
    vendorId: null,
    productId: null,
});

function getImmutableAdapter(adapter) {
    return new ImmutableAdapter({
        comName: adapter.comName,
        serialNumber: adapter.serialNumber,
        vendorId: adapter.vendorId,
        productId: adapter.productId,
        manufacturer: adapter.manufacturer,
    });
}

export default {
    getImmutableAdapter,
};
