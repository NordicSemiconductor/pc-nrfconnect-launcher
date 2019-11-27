import enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import '@testing-library/jest-dom/extend-expect';
import { configure } from '@testing-library/dom';

enzyme.configure({ adapter: new Adapter() });

if (process.env.TESTING_ASYNC_TIMEOUT != null) {
    configure({ asyncUtilTimeout: process.env.TESTING_ASYNC_TIMEOUT });
}
