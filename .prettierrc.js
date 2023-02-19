/**
 * @type {import('prettier').Options}
 * https://prettier.io/docs/en/options.html
 */
module.exports = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  overrides: [
    {
      files: '*.ts, *.tsx',
      options: {
        parser: 'typescript',
      },
    },
  ],
};
