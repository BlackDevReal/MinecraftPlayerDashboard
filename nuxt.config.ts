export default defineNuxtConfig({
  css: ['@/assets/css/main.css'],

  app: {
    head: {
      title: 'Minecraft Dashboard',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Minecraft Player Info Dashboard' }
      ]
    }
  },


  compatibilityDate: '2025-04-12'
})