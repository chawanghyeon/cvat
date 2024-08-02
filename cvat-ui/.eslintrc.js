const globalConfig = require('../.eslintrc.js');

module.exports = {
    parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
    },
    ignorePatterns: ['.eslintrc.js', 'webpack.config.js', 'node_modules/**', 'dist/**', 'tests/**'],
    extends: ['airbnb-typescript'],
    rules: {
        ...globalConfig.rules, // need to import rules again because they've been redefined by "airbnb-typescript"

        'react/no-did-update-set-state': 0, // https://github.com/airbnb/javascript/issues/1875
        'react/require-default-props': 'off',
        'react/no-unused-prop-types': 'off',
        'react/no-array-index-key': 'off',
        'react/static-property-placement': ['error', 'static public field'],
        'react/jsx-indent': ['warn', 4],
        'react/jsx-indent-props': ['warn', 4],
        'react/jsx-props-no-spreading': 0,
        'jsx-quotes': ['error', 'prefer-single'],
        'max-len': 0,
        'import/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: true,
                optionalDependencies: false,
            },
        ],
        'no-console': 0,
        'jsx-a11y/click-events-have-key-events': 0,
        'jsx-a11y/interactive-supports-focus': 0,
        'react/jsx-one-expression-per-line': 0,
        'object-curly-newline': 0,
        'arrow-parens': 0,
        'jsx-a11y/control-has-associated-label': 0,
        'react/prop-types': 0,
        'no-multiple-empty-lines': ['error', { max: 2, maxBOF: 0, maxEOF: 0 }],
        'no-promise-executor-return': 0,
        'react/function-component-definition': 0,
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
    },
    parserOptions: {
        ecmaVersion: 2022,
    },
};
