# webpack-skip-treeshaking-plugin

> a webpack5 plugin for marked some entries skip treeshaking check. It's useful for split chunk in dependOn mode.

## Usage

```
const WebpackEntrySkipTreeshakingPlugin = require('webpack-skip-treeshaking-plugin');

module.exports = {
	// an example entry definition
	entry: [
        'common.js',
        {
            import: 'index.js',
            dependOn: ['commmon.js']
        }
    ],
    plugins: [
        new WebpackEntrySkipTreeshakingPlugin({
            entries: ['common.js']
        })
    ]
};
```
