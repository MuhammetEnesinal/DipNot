import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'DipNot',
    description: 'Gezinirken kaynak toplayıp kaynaklı rapor PDF\'i üretir.',
    permissions: ['activeTab', 'contextMenus', 'scripting', 'storage'],
    action: { default_title: 'DipNot' },
  },
});
