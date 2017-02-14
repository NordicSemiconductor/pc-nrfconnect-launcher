/* eslint-disable import/first */

jest.mock('../fileUtil', () => {});

import React, { PropTypes } from 'react';
import { setPlugin, decorate } from '../plugins';
import renderer from 'react-test-renderer';

const FooComponent = ({ id }) => (
    <div id={id} />
);
FooComponent.propTypes = { id: PropTypes.string };
FooComponent.defaultProps = { id: 'foo' };

describe('decorate', () => {
    it('should render default component when plugin is not loaded', () => {
        const DecoratedFoo = decorate(FooComponent, 'Foo');
        const rendered = renderer.create(<DecoratedFoo />).toJSON();

        expect(rendered).toEqual({
            type: 'div',
            props: { id: 'foo' },
            children: null,
        });
    });

    it('should render default component when plugin does not implement decorate method', () => {
        setPlugin({});
        const DecoratedFoo = decorate(FooComponent, 'Foo');
        const rendered = renderer.create(<DecoratedFoo />).toJSON();

        expect(rendered).toEqual({
            type: 'div',
            props: { id: 'foo' },
            children: null,
        });
    });

    it('should throw error when decorate method is not a function', () => {
        setPlugin({
            decorateFoo: {},
        });
        expect(decorate(FooComponent, 'Foo')).toThrow(/not a function/);
    });

    it('should throw error when decorate method returns null', () => {
        setPlugin({
            decorateFoo: () => null,
        });
        expect(decorate(FooComponent, 'Foo')).toThrow(/No React component found/);
    });

    it('should throw error when decorate method returns an object', () => {
        setPlugin({
            decorateFoo: () => {},
        });
        expect(decorate(FooComponent, 'Foo')).toThrow(/No React component found/);
    });

    it('should render null when plugin decorates and returns null', () => {
        setPlugin({
            decorateFoo: () => (
                () => null
            ),
        });
        const DecoratedFoo = decorate(FooComponent, 'Foo');
        const rendered = renderer.create(<DecoratedFoo />).toJSON();

        expect(rendered).toEqual(null);
    });

    it('should render new element when plugin decorates and returns its own element', () => {
        setPlugin({
            decorateFoo: () => (
                () => <p>Foobar</p>
            ),
        });
        const DecoratedFoo = decorate(FooComponent, 'Foo');
        const rendered = renderer.create(<DecoratedFoo />).toJSON();

        expect(rendered).toEqual({
            type: 'p',
            props: {},
            children: ['Foobar'],
        });
    });

    it('should render component with new property value when plugin adds own value', () => {
        setPlugin({
            decorateFoo: Foo => (
                () => <Foo id="bar" />
            ),
        });
        const DecoratedFoo = decorate(FooComponent, 'Foo');
        const rendered = renderer.create(<DecoratedFoo />).toJSON();

        expect(rendered).toEqual({
            type: 'div',
            props: { id: 'bar' },
            children: null,
        });
    });

    it('should render with property when plugin uses a provided property', () => {
        setPlugin({
            decorateFoo: () => (
                props => <p id={props.bar} /> // eslint-disable-line react/prop-types
            ),
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
