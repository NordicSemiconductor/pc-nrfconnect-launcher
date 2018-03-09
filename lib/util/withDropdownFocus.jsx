import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

export default ComposedComponent => {
    class WithDropdownFocus extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                isExpanded: false,
            };
        }

        componentDidMount() {
            this.props.bindHotkey('alt+p', () => {
                this.onToggle();
            });
        }

        // React lifecycle method, called when either the props or state is
        // about to change
        componentWillUpdate(nextProps, nextState) {
            const isExpanding = !this.state.isExpanded && nextState.isExpanded;
            if (isExpanding) {
                // Focusing the dropdown button, so that up/down arrow keys
                // can be used to select serial port.
                this.focus();
            }
        }

        onToggle() {
            this.setState(prev => ({ ...prev, isExpanded: !prev.isExpanded }));
            this.props.onToggle();
        }

        focus() {
            // eslint-disable-next-line react/no-find-dom-node
            const node = ReactDOM.findDOMNode(this);
            if (node) {
                const button = node.querySelector('button');
                if (button) {
                    button.focus();
                }
            }
        }

        render() {
            return (
                <ComposedComponent
                    focus={this.focus}
                    isExpanded={this.state.isExpanded}
                    {...this.props}
                    onToggle={() => { this.onToggle(); }}
                />
            );
        }
    }

    WithDropdownFocus.propTypes = {
        bindHotkey: PropTypes.func.isRequired,
        onToggle: PropTypes.func,
    };

    WithDropdownFocus.defaultProps = {
        onToggle: () => {},
    };

    return WithDropdownFocus;
};
