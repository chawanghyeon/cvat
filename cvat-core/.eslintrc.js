module.exports = {
    ignorePatterns: [
        '.eslintrc.js',
        'webpack.config.js',
        'jest.config.js',
        'src/3rdparty/**',
        'node_modules/**',
        'dist/**',
        'tests/**/*.js',
    ],
    parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
    },
};
