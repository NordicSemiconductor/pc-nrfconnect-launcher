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

//         /*
//         * React lifecycle method that is invoked before the component
//         * renders.
//         *
//         * @param {object} nextProps Props that will be used for the next render.
//         * @returns {void}
//         */
        componentWillUpdate(nextProps, nextState) {
            const isExpanding = !this.state.isExpanded && nextState.isExpanded;
            if (isExpanding) {
                // Focusing the dropdown button, so that up/down arrow keys
                // can be used to select serial port.
                this.focus();
            }
        }

        onToggle() {
            console.log('WithDropdownFocus - onToggle()');
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
                    onToggle={()=>{this.onToggle()}}
                />
            );
        }
    }

    WithDropdownFocus.propTypes = {
        bindHotkey: PropTypes.func.isRequired,
//         isExpanded: PropTypes.bool,
        onToggle: PropTypes.func,
    };

    WithDropdownFocus.defaultProps = {
//         isExpanded: false,
        onToggle: () => {},
    };

    return WithDropdownFocus;
};
