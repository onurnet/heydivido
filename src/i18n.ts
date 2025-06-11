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
      add_friend: '• Add Friend',

      // LOGIN PAGE STRINGS
      login_title: 'Login',
      email_placeholder: 'Email',
      password_placeholder: 'Password',
      login_button: 'Login',
      login_loading: 'Logging in...',
      login_error: 'Error',

      // REGISTER PAGE STRINGS
      register_title: 'Register',
      first_name_placeholder: 'First Name',
      last_name_placeholder: 'Last Name',
      email_placeholder: 'Email',
      password_placeholder: 'Password',
      phone_placeholder: 'Phone',
      iban_placeholder: 'IBAN',
      iban_currency_placeholder: 'IBAN Currency',
      country_placeholder: 'Country',
      city_placeholder: 'City',
      register_button: 'Register',
      register_loading: 'Registering...',
      register_error: 'Error'
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
      add_friend: '• Arkadaş Ekle',

      // LOGIN PAGE STRINGS
      login_title: 'Giriş Yap',
      email_placeholder: 'E-posta',
      password_placeholder: 'Şifre',
      login_button: 'Giriş Yap',
      login_loading: 'Giriş yapılıyor...',
      login_error: 'Hata',

      //KAYIT OL
      register_title: 'Kayıt Ol',
      first_name_placeholder: 'Ad',
      last_name_placeholder: 'Soyad',
      email_placeholder: 'E-posta',
      password_placeholder: 'Şifre',
      phone_placeholder: 'Telefon',
      iban_placeholder: 'IBAN',
      iban_currency_placeholder: 'IBAN Para Birimi',
      country_placeholder: 'Ülke',
      city_placeholder: 'Şehir',
      register_button: 'Kayıt Ol',
      register_loading: 'Kayıt yapılıyor...',
      register_error: 'Hata'
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
