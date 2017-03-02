import React, { PropTypes } from 'react';
import { MenuItem } from 'react-bootstrap';

const SerialPortSelectorItem = ({ port, onSelect, menuItemCssClass }) => (
    <MenuItem
        key={port.comName}
        className={menuItemCssClass}
        eventKey={port.comName}
        onSelect={() => onSelect(port)}
    >
        <div>{port.comName}</div>
        <div style={{ fontSize: 'small' }}>{port.serialNumber || ''}</div>
    </MenuItem>
);

SerialPortSelectorItem.propTypes = {
    port: PropTypes.shape({
        comName: PropTypes.string.isRequired,
        serialNumber: PropTypes.string,
    }).isRequired,
    onSelect: PropTypes.func.isRequired,
    menuItemCssClass: PropTypes.string,
};

SerialPortSelectorItem.defaultProps = {
    menuItemCssClass: 'btn-primary',
};

export default SerialPortSelectorItem;
