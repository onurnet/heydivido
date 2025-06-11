import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      greeting: 'Hello, {{name}}',
      wallet_soon: 'Wallet (Soon)',
      gezgin_no_label: 'Your Gezgin No',
      copy_btn: 'Copy',
      copy_success: 'Copied!',
      total_expenses: 'Total Expenses',
      pending_receivables: 'Pending Receivables',
      recent_events: 'Recent Events',
      recent_expenses: 'Recent Expenses',
      people: 'people',
      nav_home: 'Home',
      nav_events: 'Events',
      nav_expenses: 'Expenses',
      nav_account: 'Account',
      add_menu_title: 'Add Menu',
      add_new_event: '• Add New Event',
      add_new_expense: '• Add New Expense',
      add_friend: '• Add Friend'
    }
  },
  tr: {
    translation: {
      greeting: 'Merhaba, {{name}}',
      wallet_soon: 'Cüzdan (Yakında)',
      gezgin_no_label: 'Gezgin Numaranız',
      copy_btn: 'Kopyala',
      copy_success: 'Kopyalandı!',
      total_expenses: 'Toplam Harcamalar',
      pending_receivables: 'Bekleyen Alacaklar',
      recent_events: 'Son Etkinlikler',
      recent_expenses: 'Son Harcamalar',
      people: 'kişi',
      nav_home: 'Ana Sayfa',
      nav_events: 'Etkinlikler',
      nav_expenses: 'Harcamalar',
      nav_account: 'Hesabım',
      add_menu_title: 'Ekleme Menüsü',
      add_new_event: '• Yeni Etkinlik Ekle',
      add_new_expense: '• Yeni Harcama Ekle',
      add_friend: '• Arkadaş Ekle'
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
