module.exports = {
  printWidth: 120,
  singleQuote: true,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: ['^react', '<THIRD_PARTY_MODULES>', '^@/(.*)$', '^[./]'],
  importOrderSortSpecifiers: true,
};
