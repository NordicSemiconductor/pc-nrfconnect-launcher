import React, { PropTypes } from 'react';
import { MenuItem } from 'react-bootstrap';

const AdapterSelectorItem = ({ adapter, onSelect }) => (
    <MenuItem
        key={adapter.comName}
        className="btn-primary"
        eventKey={adapter.comName}
        onSelect={() => onSelect(adapter.comName)}
    >
        <div className="serialPort">{adapter.comName}</div>
        <div className="serialSerialnumber">{adapter.serialNumber || ''}</div>
    </MenuItem>
);

AdapterSelectorItem.propTypes = {
    adapter: PropTypes.shape({
        comName: PropTypes.string.isRequired,
        serialNumber: PropTypes.string,
    }).isRequired,
    onSelect: PropTypes.func.isRequired,
};

export default AdapterSelectorItem;
