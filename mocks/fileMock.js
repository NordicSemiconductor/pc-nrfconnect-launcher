// Allows jest to test files that import images, fonts, etc. Jest cannot
// parse things like this, so we have to mock them. This mock just returns
// 'test-file-stub' for files that match the moduleNameMapper expression
// in package.json.
// Ref: https://facebook.github.io/jest/docs/tutorial-webpack.html

module.exports = 'test-file-stub';
