import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "HandyAcme",
  description: "A bun first Acme Library",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Get Started', link: '/get-started' }
    ],

    sidebar: [
      {
        text: 'Get Started',
        items: [
          { text: 'Installation', link: '/get-started' },
        ]
      }, {
        text: 'Get a SSL Certificate',
        items: [
          { text: 'Acme Directory', link: '/directory' },
          { text: 'Acme Account', link: '/account' },
          { text: 'Fetch', link: '/fetch' },
          { text: 'Acme Key', link: '/key' },
          { text: 'Testing', link: '/testing' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/shiny/Wilson' }
    ],

    footer: {
      message: 'HandyAcme is open source under the MIT License.',
      copyright: '&copy; 2023 Chieh Tai'
    },

    search: {
      provider: 'local'
    },
  },
  lastUpdated: true
})
