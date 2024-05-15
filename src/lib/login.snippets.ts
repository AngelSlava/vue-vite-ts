export const loginViewScriptSnippet = `// script setup
import LoginForm from '~/views/Auth/components/signin-form.vue'
import { useAuthStore } from '~/store/auth.store.ts'
import { iSignInForm } from '~/interfaces/auth.interfaces.ts'
import VaEmpty from '~/components/common/Placeholders/va-empty.vue'

const authStore = useAuthStore()

function onSubmit(payload: iSignInForm) {
  authStore.signIn(payload)
}`

export const loginViewTemplateSnippet = `<login-form :loading="authStore.loading" @submit="onSubmit" />`

export const loginFormScriptSnippet = `// script setup
import { reactive } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, email, helpers, minLength } from '@vuelidate/validators'
import { iSignInForm } from '~/interfaces/auth.interfaces.ts'
import VaButton from '~/components/common/Buttons/va-button.vue'

// Form model
const form = defineModel({ default: shallowReactive({ email: '', password: '' })})

defineProps<{
  loading?: boolean
}>()

defineExpose({
  clear: clearForm
})
const emits = defineEmits(['submit'])

// Validation rules
const rules = {
  email: {
    email: helpers.withMessage('Email not valid', email),
    required: helpers.withMessage('Email is require', required)
  },
  password: {
    required: helpers.withMessage('Password is require', required),
    minLength: minLength(8)
  }
}
const v$ = useVuelidate(rules, form)

async function onSubmit() {
  const valid = await v$.value.$validate()
  if (!valid) return
  emits('submit', form)
}

function clearForm () {
  Object.assign(form, { email: '', password: '' })
  v$.value.$reset()
}`

export const loginFormTemplateSnippet = `<template>
  <va-form :loading="loading" :rules="v$" @submit="onSubmit">
    <va-input-wrapper label="Email:" prop="email">
      <va-input v-model="form.email" reset-on-input placeholder="mail@domain.com" />
    </va-input-wrapper>

    <va-input-wrapper label="Password:" prop="password">
      <va-input v-model="form.password" password placeholder="qwerty123" />
    </va-input-wrapper>

    <div class="text-right">
      <va-button :loading="loading" submit>Enter</va-button>
    </div>
  </va-form>
</template>`

export const loginStoreSnippet = `import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import AuthApi, { iSignInForm } from '~/api/auth.api.ts'

export const useAuthStore = defineStore('auth', () => {
  // state
  const accessToken = useLocalStorage('accessToken', '')
  const loading = ref(false)
  
  //  getters
  const isAuth = computed(() => Boolean(accessToken.value))
  
  // actions
  const signIn = async (payload: iSignInForm) => {
    loading.value = true
    try {
      const response = await AuthApi.signIn(payload)
      accessToken.value = response.accessToken
      refreshToken.value = response.refreshToken
    } finally {
      loading.value = false
    }
  }
  
  const logout = () => {
    accessToken.value = ''
    refreshToken.value = ''
  }

  return {
    accessToken,
    loading,
    isAuth,
    signIn,
    logout
  }
})`

export const axiosInstanceSnippet = `import axios, { AxiosResponse } from 'axios'
import { useEventBus, useLocalStorage } from '@vueuse/core'

import useMock from '~/api/mock/adapter.mock.ts'
import { INotificationOptions } from '~/interfaces/notification.interface.ts'
import { shallowRef } from 'vue'

const notificationsBus = useEventBus('notification')
const refreshToken = useLocalStorage('refreshToken', '')
const accessToken = useLocalStorage('accessToken', '')
const isRefreshed = shallowRef(false)

const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
})

// Add Bearer token to requests
apiInstance.interceptors.request.use(
  config=> {
    const { url } = config
    const authPaths = ['/auth/login', '/auth/refresh']
    if (!authPaths.some(path => (url as string).includes(path))) {
      config.headers.Authorization = 'Bearer ' + accessToken.value
    }
    return config
  },
  error => {
    return Promise.reject(error);
  }
)

apiInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    isRefreshed.value = false
    return response.data as any
  },
  async (error) => {
    const originalRequest = error.config
    
    // Auto refresh access token 
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (!isRefreshed.value) {
        isRefreshed.value = true
        originalRequest._retry = true;
        try {
          const refreshUrl = import.meta.env.VITE_APP_API_URL + '/auth/refresh'
          const response = await axios.post(refreshUrl, { refreshToken: refreshToken.value })
          accessToken.value = response.data.accessToken
          originalRequest.headers['Authorization'] = 'Bearer ' + accessToken.value;
          isRefreshed.value = true;
          return apiInstance(originalRequest);
        } catch (refreshError) {
          isRefreshed.value = false;
          refreshToken.value = ''
          accessToken.value = ''
        }
      }
    }
    
    // Send notification
    const message = error.response.data.message
    if (message) {
      notificationsBus.emit('notify', { message, variant: 'danger', delay: 4000 } as INotificationOptions)
    }
    
    return Promise.reject(error);
  }
);

`
