
import { Dropdown } from 'react-bootstrap';
import Mousetrap from 'mousetrap';
import React from 'react';

// Like react-bootstrap's `Dropdown`, but can receive an extra `hotkey` prop:
// a key combination handled by `mousetrap` that will toggle the open state
// of the dropdown.

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

