module.exports = {
    parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
    },
    ignorePatterns: [
        '.eslintrc.js',
        'webpack.config.js',
        'node_modules/**',
        'dist/**',
    ],
};
