
import ReactDOM from 'react-dom';
import React from 'react';


// Base class for the serial port and device selector.
// Implements the common hotkey logic.
// Depends on the concrete class having the `isExpanded`, `onToggle` and `bindHotkey`
// props

export default class AbstractDeviceSelector extends React.Component {

    componentDidMount() {
        const {
            bindHotkey,
            onToggle,
        } = this.props;

        bindHotkey('alt+p', () => {
            // Focusing the dropdown button, so that up/down arrow keys
            // can be used to select serial port.
            this.focusDropdownButton();
            onToggle();
        });
    }

    /**
     * React lifecycle method that is invoked before the component
     * renders.
     *
     * @param {object} nextProps Props that will be used for the next render.
     * @returns {void}
     */
    componentWillReceiveProps(nextProps) {
        const isExpanding = !this.props.isExpanded && nextProps.isExpanded;
        if (isExpanding) {
            this.focusDropdownButton();
        }
    }


    focusDropdownButton() {
        // eslint-disable-next-line react/no-find-dom-node
        const node = ReactDOM.findDOMNode(this);
        if (node) {
            const button = node.querySelector('button');
            if (button) {
                button.focus();
            }
        }
    }
}
