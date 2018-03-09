
import { MenuItem } from 'react-bootstrap';
import Mousetrap from 'mousetrap';
import React from 'react';
import PropTypes from 'prop-types';

// Like react-bootstrap's `MenuItem`, but can receive an extra `hotkey` prop:
// a key combination handled by `mousetrap` that will click this item.

export default class HotkeyedMenuItem extends MenuItem {
    componentDidMount() {
        Mousetrap.bind(this.props.hotkey, () => { this.props.onClick(); });
    }

    componentWillUnmount() {
        Mousetrap.unbind(this.props.hotkey);
    }

    render() {
        const childProps = Object.assign({}, this.props);
        delete childProps.hotkey;
        return (<MenuItem {...childProps} />);
    }
}

HotkeyedMenuItem.propTypes = {
    hotkey: PropTypes.string,
};

HotkeyedMenuItem.defaultProps = {
    hotkey: '',
};
