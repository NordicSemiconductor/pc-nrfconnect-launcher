// Allows jest to test files that import less or css. Jest cannot
// parse things like this so we have to mock them. This mock just returns
// an empty object for files that match the moduleNameMapper expression
// in package.json.
// Ref: https://facebook.github.io/jest/docs/tutorial-webpack.html

module.exports = {
    require: jest.fn(),
    match: jest.fn(),
    app: jest.fn(),
    remote: jest.fn(),
    dialog: jest.fn(),
};
