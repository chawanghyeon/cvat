module.exports = {
    ignorePatterns: [
        '.eslintrc.js',
        'webpack.config.js',
        'node_modules/**',
        'dist/**',
    ],
    parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
    },
};
