// postcss.config.js
module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': 'postcss-nesting',
    tailwindcss: {},
    'postcss-preset-env': {
      features: {
        'nesting-rules': true,
        /*
         * The theme ships a single stylesheet for both directions, so logical
         * properties have to reach the browser as written. This feature rewrote
         * them to their LTR physical equivalents (`text-align: start` -> `left`,
         * `inset-inline-start` -> `left`), which mirrored every RTL storefront.
         */
        'logical-properties-and-values': false,
      },
    },
  }
}