/* eslint-disable import/no-extraneous-dependencies */
const sveltePreprocess = require('svelte-preprocess');

module.exports = {
  preprocess: sveltePreprocess({
    defaults: {
      style: 'scss',
    },
    scss: {
      // We can use a path relative to the root because
      // svelte-preprocess automatically adds it to `includePaths`
      // if none is defined.
      prependData: `@import 'src/styles/variables.scss';`,
    },
  }),
};