import { createApp } from 'vue'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import App from './App.vue'

// Theme
import '@unocss/reset/sanitize/sanitize.css'
import '@unocss/reset/sanitize/assets.css'
import '@unocss/reset/sanitize/forms.css'
import '@unocss/reset/sanitize/typography.css'
import '@unocss/reset/sanitize/reduce-motion.css'
import '@unocss/reset/sanitize/system-ui.css'

import 'virtual:uno.css'
import '~/styles/main.scss'
import { useThemeStore } from '~/store/theme.store.ts'
import useRegisterUtils from '~/utils/register.utils.ts'
const { registerLayouts } = useRegisterUtils()
import detectChildren from '~/directives/detect-children.directive.ts'

import pinia from '~/store'
import router from '~/router'

const app = createApp(App)
registerLayouts(app)

app.directive('detect-children', detectChildren)

app.use(pinia)
app.use(router)
app.use(autoAnimatePlugin)
app.mount('#app')

const themeStore = useThemeStore()
themeStore.applyTheme()
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (themeStore.theme === 'system') {
    const newTheme = e.matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme)
  }
})

