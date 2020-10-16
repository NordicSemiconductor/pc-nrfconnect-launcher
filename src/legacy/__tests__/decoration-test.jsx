/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { combineReducers } from 'redux';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import {
    setApp,
    clearDecorationCache,
    decorate,
    decorateReducer,
    connect,
    invokeAppFn,
} from '../decoration';

beforeEach(clearDecorationCache);

describe('decorate', () => {
    const FooComponent = ({ id }) => <div id={id} />;
    FooComponent.propTypes = { id: PropTypes.string };
    FooComponent.defaultProps = { id: 'foo' };

    it('should render default component when app does not implement decorate method', () => {
        setApp({});
        const DecoratedFoo = decorate(FooComponent, 'Foo');
        const rendered = renderer.create(<DecoratedFoo />).toJSON();

        expect(rendered).toEqual({
            type: 'div',
            props: { id: 'foo' },
            children: null,
        });
    });

    it('should throw error when decorate method is not a function', () => {
        setApp({
            decorateFoo: {},
        });
        expect(decorate(FooComponent, 'Foo')).toThrow(/not a function/);
    });

    it('should throw error when decorate method returns null', () => {
        setApp({
            decorateFoo: () => null,
        });
        expect(decorate(FooComponent, 'Foo')).toThrow(
            /No React component found/
        );
    });

    it('should throw error when decorate method returns an object', () => {
        setApp({
            decorateFoo: () => {},
        });
        expect(decorate(FooComponent, 'Foo')).toThrow(
            /No React component found/
        );
    });

    it('should render null when app decorates and returns null', () => {
        setApp({
            decorateFoo: () => () => null,
        });
        const DecoratedFoo = decorate(FooComponent, 'Foo');
        const rendered = renderer.create(<DecoratedFoo />).toJSON();

        expect(rendered).toEqual(null);
    });

    it('should render new element when app decorates and returns its own element', () => {
        setApp({
            decorateFoo: () => () => <p>Foobar</p>,
        });
        const DecoratedFoo = decorate(FooComponent, 'Foo');
        const rendered = renderer.create(<DecoratedFoo />).toJSON();

        expect(rendered).toEqual({
            type: 'p',
            props: {},
            children: ['Foobar'],
        });
    });

    it('should render component with new property value when app adds own value', () => {
        setApp({
            decorateFoo: Foo => () => <Foo id="bar" />,
        });
        const DecoratedFoo = decorate(FooComponent, 'Foo');
        const rendered = renderer.create(<DecoratedFoo />).toJSON();

        expect(rendered).toEqual({
            type: 'div',
            props: { id: 'bar' },
            children: null,
        });
    });

    it('should render with property when app uses a provided property', () => {
        setApp({
            decorateFoo: () => ({ bar }) => <p id={bar} />, // eslint-disable-line react/prop-types
        });
        const DecoratedFoo = decorate(FooComponent, 'Foo');
        const rendered = renderer.create(<DecoratedFoo bar="baz" />).toJSON();

        expect(rendered).toEqual({
            type: 'p',
            props: { id: 'baz' },
            children: null,
        });
    });
});

describe('connect', () => {
    const FooComponent = ({ id, onClick }) => (
        <button id={id} onClick={onClick} /> // eslint-disable-line react/button-has-type
    );
    FooComponent.propTypes = {
        id: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
    };

    const defaultStateProps = { id: 'foo' };
    const defaultDispatchProps = { onClick: () => {} };
    const mapStateToProps = () => defaultStateProps;
    const mapDispatchToProps = () => defaultDispatchProps;

    // The react-redux connect function requires that a Provider component
    // has been rendered higher up in the component hierarchy. In our app
    // we do this in the Root container. We have to do the same when testing
    // containers.
    const storeFake = () => ({
        default: () => {},
        subscribe: () => {},
        dispatch: () => {},
        getState: () => {},
    });
    const renderWithProvider = Component =>
        renderer
            .create(
                <Provider store={storeFake()}>
                    <Component />
                </Provider>
            )
            .toJSON();

    it('should render with default props when app does not implement mapToProps functions', () => {
        setApp({});

        const ConnectedFoo = connect(mapStateToProps, mapDispatchToProps)(
            FooComponent,
            'Foo'
        );

        expect(renderWithProvider(ConnectedFoo)).toEqual({
            type: 'button',
            props: {
                ...defaultStateProps,
                ...defaultDispatchProps,
            },
            children: null,
        });
    });

    it('should render with new state props when app implements mapStateToProps', () => {
        const appStateProps = { id: 'bar' };
        setApp({
            mapFooState: () => appStateProps,
        });

        const ConnectedFoo = connect(mapStateToProps, mapDispatchToProps)(
            FooComponent,
            'Foo'
        );

        expect(renderWithProvider(ConnectedFoo)).toEqual({
            type: 'button',
            props: {
                ...appStateProps,
                ...defaultDispatchProps,
            },
            children: null,
        });
    });

    it('should render with new dispatch props when app implements mapDispatchToProps', () => {
        const appDispatchProps = { onClick: () => {} };
        setApp({
            mapFooDispatch: () => appDispatchProps,
        });

        const ConnectedFoo = connect(mapStateToProps, mapDispatchToProps)(
            FooComponent,
            'Foo'
        );

        expect(renderWithProvider(ConnectedFoo)).toEqual({
            type: 'button',
            props: {
                ...defaultStateProps,
                ...appDispatchProps,
            },
            children: null,
        });
    });
});

describe('decorateReducer', () => {
    const initialState = {};
    const FOO_ACTION = 'FOO_ACTION';

    const fooReducer = (state = initialState, action) => {
        switch (action.type) {
            case FOO_ACTION:
                return {
                    ...state,
                    foo: action.value,
                };
            default:
                return state;
        }
    };

    it('should handle default action when app does not decorate reducer', () => {
        setApp({});
        const decoratedReducer = decorateReducer(fooReducer, 'Foo');

        const state = decoratedReducer(initialState, {
            type: FOO_ACTION,
            value: 'foobar',
        });

        expect(state.foo).toEqual('foobar');
    });

    it('should throw error if reducer is not a function', () => {
        setApp({
            reduceFoo: {},
        });
        const decoratedReducer = decorateReducer(fooReducer, 'Foo');

        expect(() =>
            decoratedReducer(initialState, {
                type: FOO_ACTION,
                value: 'foobar',
            })
        ).toThrow(/Not a function/);
    });

    it('should override value set by default reducer when app decorates reducer with new value', () => {
        setApp({
            reduceFoo: (state, action) => {
                switch (action.type) {
                    case FOO_ACTION:
                        return {
                            ...state,
                            foo: `${action.value} override!`,
                        };
                    default:
                        return state;
                }
            },
        });
        const decoratedReducer = decorateReducer(fooReducer, 'Foo');

        const state = decoratedReducer(initialState, {
            type: FOO_ACTION,
            value: 'foobar',
        });

        expect(state.foo).toEqual('foobar override!');
    });

    it('should handle new action when app decorates reducer with new action', () => {
        const BAR_ACTION = 'BAR_ACTION';
        setApp({
            reduceFoo: (state, action) => {
                switch (action.type) {
                    case BAR_ACTION:
                        return {
                            ...state,
                            bar: action.value,
                        };
                    default:
                        return state;
                }
            },
        });
        const decoratedReducer = decorateReducer(fooReducer, 'Foo');

        const state = decoratedReducer(initialState, {
            type: BAR_ACTION,
            value: 1337,
        });

        expect(state.bar).toEqual(1337);
    });

    it('should combine reducers when app decorates with combineReducers', () => {
        const BAR_ACTION = 'BAR_ACTION';
        const BAZ_ACTION = 'BAZ_ACTION';
        const appReducer = (state = {}) => state;
        const barReducer = (state = initialState, action) => {
            switch (action.type) {
                case BAR_ACTION:
                    return {
                        ...state,
                        value: action.value,
                    };
                default:
                    return state;
            }
        };
        const bazReducer = (state = initialState, action) => {
            switch (action.type) {
                case BAZ_ACTION:
                    return {
                        ...state,
                        value: action.value,
                    };
                default:
                    return state;
            }
        };
        setApp({
            reduceApp: combineReducers({
                bar: barReducer,
                baz: bazReducer,
            }),
        });
        const decoratedReducer = decorateReducer(appReducer, 'App');

        const firstState = decoratedReducer(initialState, {
            type: BAR_ACTION,
            value: 'bar',
        });
        const secondState = decoratedReducer(firstState, {
            type: BAZ_ACTION,
            value: 'baz',
        });

        expect(secondState).toEqual({
            bar: {
                value: 'bar',
            },
            baz: {
                value: 'baz',
            },
        });
    });
});

describe('invokeAppFn', () => {
    it('should throw error if no app is loaded', () => {
        setApp(null);
        expect(() => invokeAppFn()).toThrow(/no app is loaded/);
    });

    it('should invoke app function with parameters if implemented', () => {
        const foobarFn = jest.fn();
        setApp({ foobarFn });
        invokeAppFn('foobarFn', 1, 'bar');
        expect(foobarFn).toHaveBeenCalledWith(1, 'bar');
    });
});
