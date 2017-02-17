import React, { PropTypes } from 'react';
import { MenuItem } from 'react-bootstrap';

const AdapterSelectorItem = ({ adapter, onSelect, menuItemCssClass }) => (
    <MenuItem
        key={adapter.comName}
        className={menuItemCssClass}
        eventKey={adapter.comName}
        onSelect={() => onSelect(adapter)}
    >
        <div>{adapter.comName}</div>
        <div style={{ fontSize: 'small' }}>{adapter.serialNumber || ''}</div>
    </MenuItem>
);

AdapterSelectorItem.propTypes = {
    adapter: PropTypes.shape({
        comName: PropTypes.string.isRequired,
        serialNumber: PropTypes.string,
    }).isRequired,
    onSelect: PropTypes.func.isRequired,
    menuItemCssClass: PropTypes.string,
};

AdapterSelectorItem.defaultProps = {
    menuItemCssClass: 'btn-primary',
};

export default AdapterSelectorItem;
