import plugin from 'tailwindcss/plugin'

export default {
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('cursor-expanded', '&.cursor-expanded')
    }),
  ],
}