<script setup lang="ts">
import LoginForm from '~/views/Auth/components/signin-form.vue'
import { useAuthStore } from '~/store/auth.store.ts'
import VaEmpty from '~/components/common/Placeholders/va-empty.vue'
import { shallowReactive } from 'vue';
import {
  loginFormScriptSnippet,
  loginFormTemplateSnippet,
  loginStoreSnippet,
  axiosInstanceSnippet
} from "~/lib/login.snippets.ts";
import { iSignInForm } from '~/interfaces/auth.interfaces.ts';
import { loginPageViewSnippet } from '~/lib/view.snippets.ts';

const authStore = useAuthStore()

const form = shallowReactive<iSignInForm>({
  email: 'mail@domain.com',
  password: 'qwerty123'
})
</script>

<template>
  <div class="mb-8">
    <div class="mb-8">
      <va-empty v-if="authStore.isAuth" content="You are is logged in">
        <va-button @click="authStore.logout">Logout</va-button>
      </va-empty>
      <div v-else style="max-width: 480px; margin: 0 auto">
        <login-form v-model="form" :loading="authStore.loading" @submit="authStore.signIn" />
      </div>
    </div>

    <va-tabs>
      <va-tab label="Login View">
        <code-snippet language="JavaScript" text="SignInView.vue" :code="loginPageViewSnippet" />
      </va-tab>
      <va-tab label="Form Component">
        <code-snippet language="JavaScript" text="script" :code="loginFormScriptSnippet" />
        <code-snippet text="template" :code="loginFormTemplateSnippet" />
      </va-tab>
      <va-tab label="Auth Store">
        <code-snippet language="JavaScript" text="script" :code="loginStoreSnippet" />
      </va-tab>
      <va-tab label="Axios Instance">
        <code-snippet language="JavaScript" text="script" :code="axiosInstanceSnippet" />
      </va-tab>
    </va-tabs>
  </div>
</template>
