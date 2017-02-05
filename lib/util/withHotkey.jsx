import React from 'react';
import Mousetrap from 'mousetrap';

export default ComposedComponent => (
    class WithHotkey extends React.Component {
        constructor(props) {
            super(props);
            this.bindings = [];
            this.bindHotkey = this.bindHotkey.bind(this);
        }

        bindHotkey(key, callback, action) {
            Mousetrap.bind(key, callback, action);
            this.bindings.push(key);
        }

        componentWillUnmount() {
            this.bindings.forEach(key => Mousetrap.unbind(key));
        }

        render() {
            return (
                <ComposedComponent
                    bindHotkey={this.bindHotkey}
                    {...this.props}
                />
            );
        }
    }
);
