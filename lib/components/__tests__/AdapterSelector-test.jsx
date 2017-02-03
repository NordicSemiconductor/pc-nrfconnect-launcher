import React from 'react';
import renderer from 'react-test-renderer';
import AdapterSelector from '../AdapterSelector';

describe('AdapterSelector', () => {
    it('should render correctly', () => {
        const tree = renderer.create(<AdapterSelector />).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
