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
      nav_account: 'Profile',
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
      back_to_home: 'Back',
      welcome_back: 'Welcome Back',

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
      register_error: 'Error',
      join_divido: 'Join the Divido community',
      confirm_password_placeholder: 'Confirm Password',
      password_mismatch: 'Passwords do not match.',
      password_too_short: 'Password must be at least 6 characters long.',
      no_internet_connection:
        'No internet connection. Please check your network and try again.',
      registration_successful:
        'Registration successful! Please check your email to verify your account.',
      registration_failed: 'Registration failed. Please try again.',
      already_have_account: 'Already have an account?',
      sign_in_instead: 'Sign In Instead',
      offline_message: "You're offline. Check your connection.",
      offline_button: 'Offline',
      preferred_language_label: 'Preferred Language',
      language_english: 'English',
      language_turkish: 'Turkish',

      // PROFILE PAGE STRINGS
      logout_button: 'Logout',
      logging_out: 'Logging out...',
      enter_your_iban: 'Enter your IBAN',

      // ADD EVENT PAGE STRINGS

      event_name_label: 'Event Name',
      event_description_label: 'Event Description',
      event_currency_label: 'Event Currency',
      event_planned_start_date_label: 'Planned Start Date',
      event_planned_duration_days_label: 'Planned Duration (days)',
      save_event_button: 'Save Event',
      saving_event: 'Saving...',
      event_created_successfully: 'Event created successfully',
      failed_create_event: 'Failed to create event',
      fill_required_fields: 'Please fill all required fields',
      default_currency_label: 'Default Currency',
      event_category_label: 'Event Category',
      event_category_option_long_vacation: 'Long Vacation',
      event_category_option_short_trip: 'Short Trip',
      event_category_option_dining_friends: 'Dining with Friends',
      event_category_option_weekend_fun: 'Weekend Fun',
      event_category_option_special_occasion: 'Special Occasion Celebration',
      event_category_option_other: 'Other',

      //  EVENTS PAGE STRINGS
      events_title: 'Events',
      not_specified: 'Not Specified',
      day: 'Day',
      days: 'Days',

      //  EVENT DETAIL STRINGS
      event_details_title: 'Event Details',
      event_date_label: 'Event Date',
      event_duration_label: 'Duration',
      event_location_label: 'Location',
      edit_event_button: 'Edit',
      share_event_button: 'Share',
      expenses_section_title: 'Expenses',
      add_expense_button: 'Add Expense',
      no_expenses_yet: 'No Expenses Yet',

      // ADD EXPENSE STRINGS

      place_expense: 'Place Expense',
      general_expense: 'General Expense',
      select_place: 'Select Place',
      amount_label: 'Amount',
      paid_by_label: 'Paid By',
      participants_label: 'Participants',
      split_equal: 'Split Equally',
      split_manual: 'Split Manually',
      failed_create_expense: 'Failed to create expense',
      expense_created_successfully: 'Expense created successfully',
      saving_expense: 'Saving...',
      save_expense_button: 'Save',
      expense_type_label: 'Expense Type',
      split_method_label: 'Split Method',

      // LANDING PAGE STRINGS
      hero: {
        title: 'Divido',
        subtitle:
          'Split expenses effortlessly. Travel together, pay together, stay friends forever.',
        description:
          'The smart way to manage group expenses during your adventures ✈️',
        cta: {
          primary: 'Start Splitting Now',
          secondary: 'Login'
        }
      },
      features: {
        title: 'Why Choose Divido?',
        subtitle:
          'No more awkward money conversations. No more complicated calculations. Just simple, fair expense splitting.',
        items: [
          {
            icon: '💰',
            title: 'Smart Expense Tracking',
            description:
              'Add expenses in seconds. Take photos of receipts. Categorize automatically. Never lose track of who paid for what.'
          },
          {
            icon: '🌍',
            title: 'Multi-Currency Support',
            description:
              'Traveling internationally? No problem! Automatic currency conversion keeps everyone on the same page, no matter where you are.'
          },
          {
            icon: '📱',
            title: 'Works Offline',
            description:
              "No internet? No worries! Add expenses offline and sync when you're back online. Perfect for remote adventures."
          },
          {
            icon: '🔍',
            title: 'Complete Transparency',
            description:
              'Everyone sees everything. Detailed breakdowns, payment history, and crystal-clear settlement suggestions keep friendships intact.'
          }
        ]
      },
      howItWorks: {
        title: 'How It Works',
        subtitle:
          "Get started in minutes. It's so simple, your grandma could use it.",
        steps: [
          {
            icon: '👥',
            title: 'Create Your Group',
            description:
              "Add your travel buddies and you're ready to go. Send them a simple invite link."
          },
          {
            icon: '📸',
            title: 'Add Expenses',
            description:
              'Snap a photo of the receipt or enter manually. Choose who participated in each expense.'
          },
          {
            icon: '⚡',
            title: 'Get Smart Splits',
            description:
              'We calculate who owes what automatically. Fair, transparent, and drama-free.'
          },
          {
            icon: '💳',
            title: 'Settle Up',
            description:
              'See exactly who owes whom. Send payment reminders or mark as paid when settled.'
          }
        ]
      },
      testimonials: {
        title: 'What Travelers Say',
        subtitle:
          "Don't just take our word for it. Here's what real travelers think about Divido.",
        items: [
          {
            text: 'Finally! No more awkward conversations about money during trips. Divido made our European backpacking adventure so much smoother.',
            author: 'Sarah Chen',
            title: 'Travel Blogger'
          },
          {
            text: 'The offline feature saved us in the mountains of Nepal. We could track everything without worrying about internet connection.',
            author: 'Mike Rodriguez',
            title: 'Adventure Photographer'
          },
          {
            text: 'Multi-currency support is a game-changer. Our group traveled through 5 countries and Divido handled all the conversions perfectly.',
            author: 'Anna Schmidt',
            title: 'Digital Nomad'
          }
        ]
      },
      cta: {
        title: 'Ready to Split Smart?',
        subtitle:
          "Join thousands of travelers who've made money splitting stress-free",
        buttons: {
          signup: 'Get Started Free',
          login: 'Sign In'
        }
      },
      footer: {
        brand: 'Divido',
        links: {
          website: 'heyDivido.com',
          privacy: 'Privacy Policy',
          terms: 'Terms of Service',
          support: 'Support',
          download: 'Download App'
        },
        copyright: '© 2025 Divido. Making group expenses simple since 2025.',
        tagline: 'Split smart. Travel together. Stay friends.'
      },

      // PROFILE PAGE STRINGS
      profile_title: 'My Profile',
      divido_number_label: 'Divido Number',
      first_name_label: 'First Name',
      last_name_label: 'Last Name',
      email_label: 'Email',
      phone_number_label: 'Phone Number',
      preferred_language_label: 'Preferred Language',
      country_label: 'Country',
      city_label: 'City',
      new_password_label: 'New Password (leave empty to keep current)',
      first_name_placeholder: 'Enter first name',
      last_name_placeholder: 'Enter last name',
      email_placeholder: 'Enter email',
      phone_placeholder: 'Enter phone number',
      city_placeholder: 'Enter city',
      password_placeholder: 'Enter new password',
      select_country: 'Select country',
      update_button: 'Update',
      delete_account_button: 'Delete My Account',
      updating: 'Updating...',
      deleting: 'Deleting...',
      profile_updated: 'Profile updated successfully',
      account_deleted: 'Account deleted successfully',
      loading_profile: 'Loading profile...',
      failed_load_profile: 'Failed to load profile',
      user_not_authenticated: 'User not authenticated',
      failed_update_profile: 'Failed to update profile',
      failed_update_password: 'Failed to update password',
      failed_delete_account: 'Failed to delete account',
      confirm_delete_account:
        'Are you sure you want to delete your account? This action cannot be undone.'
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
      nav_account: 'Profilim',
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
      back_to_home: 'Geri',
      welcome_back: 'Tekrar hoşgeldiniz',

      // REGISTER PAGE STRINGS
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
      register_error: 'Hata',
      join_divido: 'Divido topluluğuna katıl',
      confirm_password_placeholder: 'Şifreyi Onayla',
      password_mismatch: 'Şifreler eşleşmiyor.',
      password_too_short: 'Şifre en az 6 karakter uzunluğunda olmalıdır.',
      no_internet_connection:
        'İnternet bağlantısı yok. Lütfen ağınızı kontrol edin ve tekrar deneyin.',
      registration_successful:
        'Kayıt başarılı! Lütfen hesabınızı doğrulamak için e-postanızı kontrol edin.',
      registration_failed: 'Kayıt başarısız. Lütfen tekrar deneyin.',
      already_have_account: 'Zaten hesabınız var mı?',
      sign_in_instead: 'Giriş Yap',
      offline_message: 'Çevrimdışısınız. Bağlantınızı kontrol edin.',
      offline_button: 'Çevrimdışı',
      preferred_language_label: 'Tercih Edilen Dil',
      language_english: 'İngilizce',
      language_turkish: 'Türkçe',

      // PROFILE PAGE STRINGS
      logout_button: 'Çıkış Yap',
      logging_out: 'Çıkış Yapılıyor...',
      enter_your_iban: 'IBAN bilgisi giriniz',

      // ADD EVENT PAGE STRINGS

      event_name_label: 'Etkinlik Adı',
      event_description_label: 'Etkinlik Açıklaması',
      event_currency_label: 'Etkinlik Temel Para Birimi',
      event_planned_start_date_label: 'Planlanan Başlangıç Tarihi',
      event_planned_duration_days_label: 'Planlanan Gün (gün sayısı)',
      save_event_button: 'Etkinliği Kaydet',
      saving_event: 'Kaydediliyor...',
      event_created_successfully: 'Etkinlik başarıyla oluşturuldu',
      failed_create_event: 'Etkinlik oluşturulamadı',
      fill_required_fields: 'Lütfen gerekli tüm alanları doldurun',
      default_currency_label: 'Etkinlik Para Birimi',
      event_category_label: 'Etkinlik Kategorisi',
      event_category_option_long_vacation: 'Uzun Tatil',
      event_category_option_short_trip: 'Kısa Seyahat',
      event_category_option_dining_friends: 'Arkadaşlarla Yemek',
      event_category_option_weekend_fun: 'Haftasonu Eğlencesi',
      event_category_option_special_occasion: 'Özel Gün Kutlaması',
      event_category_option_other: 'Diğer',

      //  EVENTS PAGE STRINGS
      events_title: 'Etkinlikler',
      not_specified: 'Belirtilmemiş',
      day: 'Gün',
      days: 'Gün',
      no_expenses_yet: 'Henüz Bir Harcama Yok',

      //  EVENT DETAIL STRINGS
      event_details_title: 'Etkinlik Detayları',
      event_date_label: 'Etkinlik Tarihi',
      event_duration_label: 'Süre',
      event_location_label: 'Konum',
      edit_event_button: 'Düzenle',
      share_event_button: 'Paylaş',
      expenses_section_title: 'Harcamalar',
      add_expense_button: 'Harcama Ekle',

      // ADD EXPENSE STRINGS

      place_expense: 'Mekan Harcaması',
      general_expense: 'Genel Harcama',
      select_place: 'Mekan Seçin',
      amount_label: 'Tutar',
      paid_by_label: 'Kim Ödedi?',
      participants_label: 'Kimler İçin?',
      split_equal: 'Eşit Böl',
      split_manual: 'Manuel Böl',
      failed_create_expense: 'Harcama kaydedilemedi',
      expense_created_successfully: 'Harcama başarıyla kaydedildi',
      saving_expense: 'Kaydediliyor...',
      save_expense_button: 'Kaydet',
      expense_type_label: 'Harcama Tipi',
      split_method_label: 'Bölüştürme Şekli',

      // LANDING PAGE STRINGS
      hero: {
        title: 'Divido',
        subtitle:
          'Masrafları zahmetsizce paylaşın. Birlikte seyahat edin, birlikte ödeyin, sonsuza kadar arkadaş kalın.',
        description:
          'Maceralarınız sırasında grup masraflarını yönetmenin akıllı yolu ✈️',
        cta: {
          primary: 'Şimdi Paylaşmaya Başla',
          secondary: 'Giriş Yap'
        }
      },
      features: {
        title: "Neden Divido'yu Seçmelisiniz?",
        subtitle:
          'Artık garip para konuşmaları yok. Karmaşık hesaplamalar yok. Sadece basit, adil masraf paylaşımı.',
        items: [
          {
            icon: '💰',
            title: 'Akıllı Masraf Takibi',
            description:
              'Saniyeler içinde masraf ekleyin. Fişlerin fotoğrafını çekin. Otomatik kategorilendirme. Kimin neyi ödediğini asla kaybetmeyin.'
          },
          {
            icon: '🌍',
            title: 'Çoklu Para Birimi Desteği',
            description:
              'Uluslararası seyahat mi? Sorun değil! Otomatik para birimi dönüşümü, nerede olursanız olun herkesi aynı sayfada tutar.'
          },
          {
            icon: '📱',
            title: 'Çevrimdışı Çalışır',
            description:
              'İnternet yok mu? Sorun değil! Çevrimdışı masraf ekleyin ve tekrar çevrimiçi olduğunuzda senkronize edin. Uzak maceralar için mükemmel.'
          },
          {
            icon: '🔍',
            title: 'Tam Şeffaflık',
            description:
              'Herkes her şeyi görür. Detaylı döküm, ödeme geçmişi ve kristal berraklığında ödeme önerileri dostlukları korur.'
          }
        ]
      },
      howItWorks: {
        title: 'Nasıl Çalışır',
        subtitle:
          'Dakikalar içinde başlayın. O kadar basit ki, büyükanneniz bile kullanabilir.',
        steps: [
          {
            icon: '👥',
            title: 'Grubunuzu Oluşturun',
            description:
              'Seyahat arkadaşlarınızı ekleyin ve hazırsınız. Onlara basit bir davet linki gönderin.'
          },
          {
            icon: '📸',
            title: 'Masraf Ekleyin',
            description:
              'Fişin fotoğrafını çekin veya manuel olarak girin. Her masrafa kimin katıldığını seçin.'
          },
          {
            icon: '⚡',
            title: 'Akıllı Paylaşım Alın',
            description:
              'Kimin neyi borçlu olduğunu otomatik olarak hesaplıyoruz. Adil, şeffaf ve drama-free.'
          },
          {
            icon: '💳',
            title: 'Hesaplaşın',
            description:
              'Kimin kime ne kadar borçlu olduğunu tam olarak görün. Ödeme hatırlatıcıları gönderin veya ödendiğinde işaretleyin.'
          }
        ]
      },
      testimonials: {
        title: 'Gezginler Ne Diyor',
        subtitle:
          'Sadece bizim sözümüze güvenmeyin. Gerçek gezginlerin Divido hakkında düşündükleri burada.',
        items: [
          {
            text: 'Sonunda! Artık seyahatlerde para konusunda garip konuşmalar yok. Divido Avrupa sırt çantası maceramızı çok daha sorunsuz hale getirdi.',
            author: 'Ayşe Kaya',
            title: 'Seyahat Blogcusu'
          },
          {
            text: 'Çevrimdışı özellik bizi Nepal dağlarında kurtardı. İnternet bağlantısı konusunda endişelenmeden her şeyi takip edebildik.',
            author: 'Mehmet Özkan',
            title: 'Macera Fotoğrafçısı'
          },
          {
            text: 'Çoklu para birimi desteği oyun değiştirici. Grubumuz 5 ülkede seyahat etti ve Divido tüm dönüşümleri mükemmel bir şekilde halletti.',
            author: 'Zeynep Demir',
            title: 'Dijital Göçebe'
          }
        ]
      },
      cta: {
        title: 'Akıllı Paylaşmaya Hazır mısınız?',
        subtitle:
          'Para paylaşımını stressiz hale getiren binlerce gezgine katılın',
        buttons: {
          signup: 'Ücretsiz Başlayın',
          login: 'Giriş Yapın'
        }
      },
      footer: {
        brand: 'Divido',
        links: {
          website: 'heyDivido.com',
          privacy: 'Gizlilik Politikası',
          terms: 'Kullanım Şartları',
          support: 'Destek',
          download: 'Uygulamayı İndir'
        },
        copyright:
          "© 2025 Divido. 2025'ten beri grup masraflarını basitleştiriyoruz.",
        tagline: 'Akıllı paylaş. Birlikte seyahat et. Arkadaş kal.'
      },

      // PROFILE PAGE STRINGS
      profile_title: 'Profilim',
      divido_number_label: 'Divido Numarası',
      first_name_label: 'Ad',
      last_name_label: 'Soyad',
      email_label: 'E-posta',
      phone_number_label: 'Telefon Numarası',
      preferred_language_label: 'Tercih Edilen Dil',
      country_label: 'Ülke',
      city_label: 'Şehir',
      new_password_label: 'Yeni Şifre (boş bırakırsanız mevcut şifre korunur)',
      first_name_placeholder: 'Adınızı girin',
      last_name_placeholder: 'Soyadınızı girin',
      email_placeholder: 'E-posta adresinizi girin',
      phone_placeholder: 'Telefon numaranızı girin',
      city_placeholder: 'Şehir girin',
      password_placeholder: 'Yeni şifrenizi girin',
      select_country: 'Ülke seçin',
      update_button: 'Güncelle',
      delete_account_button: 'Hesabımı Sil',
      updating: 'Güncelleniyor...',
      deleting: 'Siliniyor...',
      profile_updated: 'Bilgileriniz güncellendi',
      account_deleted: 'Hesabınız silindi',
      loading_profile: 'Profil yükleniyor...',
      failed_load_profile: 'Profil yüklenemedi',
      user_not_authenticated: 'Kullanıcı doğrulanmadı',
      failed_update_profile: 'Profil güncellenemedi',
      failed_update_password: 'Şifre güncellenemedi',
      failed_delete_account: 'Hesap silinemedi',
      confirm_delete_account:
        'Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en', // veya varsayılan dili buradan değiştirirsin
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
