
import { Dropdown } from 'react-bootstrap';
import Mousetrap from 'mousetrap';
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

// Like react-bootstrap's `Dropdown`, but can receive an extra `hotkey` prop:
// a key combination handled by `mousetrap` that will toggle the open state
// of the dropdown.
// Also handles focusing the drop-down on the hotkey.

export default class HotkeyedDropdown extends Dropdown {
    constructor(props) {
        super(props);
        this.state = { open: false };
    }

    componentDidMount() {
        Mousetrap.bind(this.props.hotkey, () => { this.toggle(); });
    }

    componentWillUnmount() {
        Mousetrap.unbind(this.props.hotkey);
    }

    toggle() {
        this.setState({ open: !this.state.open });

        if (this.state.open) {
            // Focus the drop-down
            // eslint-disable-next-line react/no-find-dom-node
            const node = ReactDOM.findDOMNode(this);
            if (node) {
                const button = node.querySelector('button');
                if (button) {
                    button.focus();
                }
            }
        }

        this.props.onToggle();
    }

    render() {
        const childProps = Object.assign({}, this.props);
        delete childProps.hotkey;
        return (<Dropdown
            {...childProps}
            open={this.state.open && !this.props.disabled}
            onToggle={() => { this.toggle(); }}
        />);
    }
}

HotkeyedDropdown.propTypes = {
    hotkey: PropTypes.string,
    onToggle: PropTypes.func,
};

HotkeyedDropdown.defaultProps = {
    hotkey: '',
    onToggle: () => {},
};
