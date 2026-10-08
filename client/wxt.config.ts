import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'DipNot',
    description: 'Gezinirken kaynak toplayıp kaynaklı rapor PDF\'i üretir.',
    permissions: ['activeTab', 'contextMenus', 'scripting'],
    action: { default_title: 'DipNot' },
  },
});
