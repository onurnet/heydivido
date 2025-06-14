import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      greeting: 'Hello, {{name}}',
      wallet_soon: 'Wallet (Soon)',
      gezgin_no_label: 'Divido No',
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
      remember_me: 'Remember Me',
      login_successfull: 'Login Successful',
      forgot_password: 'Forgot Password',

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
      dont_have_account: "Don't Have Account?",
      register_instead: 'Register Instead',

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
      my_events_title: 'My Events',
      events_you_participate_in: 'Events you participate in',
      show_passive_events: 'Show passive events',
      no_events_participated: 'No events participated',
      create_first_event: 'Create First Event',

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
      participants_count_label: 'Participants',
      total_expenses_label: 'Total Expenses',
      participant: 'participant',
      participants: 'participants',
      participants_list_title: 'Event Participants',
      close: 'Close',
      no_email: 'No email provided',
      loading_participants: 'Loading participants...',

      //  EVENT DETAIL EDIT STRINGS
      only_admin_can_edit: 'Only admins can edit this event',
      event_participants: 'Event Participants',
      no_participants_yet: 'No participants yet',
      role_admin: 'Admin',
      role_participant: 'Participant',
      joined: 'Joined',
      remove: 'Remove',
      removing: 'Removing...',
      cannot_remove_yourself: 'You cannot remove yourself',
      confirm_remove_participant: 'Remove {{name}} from the event?',
      participant_removed_successfully: 'Participant removed successfully',
      failed_remove_participant: 'Failed to remove participant',
      make_passive_button: 'Make Passive',
      delete_event_button: 'Delete Event',
      confirm_delete_event: 'Are you sure you want to delete this event?',
      confirm_make_passive_event:
        'Are you sure you want to make this event passive?',
      event_deleted_successfully: 'Event deleted successfully',
      event_made_passive_successfully: 'Event made passive successfully',
      failed_delete_event: 'Failed to delete event',
      failed_make_passive_event: 'Failed to make event passive',
      back_to_event: 'Back to Event',
      failed_load_participants: 'Failed to load participants',
      role_member: 'Member',
      event_description_label: 'Event Description',
      event_description_placeholder: 'Describe your event...',
      confirm_delete_event_title: 'Confirm Delete?',
      confirm_make_passive_title: 'Confirm Passive?',

      // Invite system
      youre_invited: "You're Invited!",
      join_event_invitation: 'Join this event to track expenses together',
      invalid_or_expired_invitation: 'Invalid or expired invitation',
      invitation_not_found_or_expired: 'Invitation not found or has expired',
      loading_invitation: 'Loading invitation...',
      login_required_to_join_event:
        'Please login or register to join this event',
      login_to_join: 'Login to Join Event',
      register_to_join: 'Create Account to Join',
      join_event: 'Join Event',
      joining_event: 'Joining...',
      already_joined_event: "You're already a member of this event",
      successfully_joined_event: 'Successfully joined the event!',
      failed_join_event: 'Failed to join event',
      please_login_to_join: 'Please login to join this event',
      failed_process_invitation: 'Failed to process invitation',
      only_admin_can_invite: 'Only event admins can create invite links',
      existing_invite_link_copied: 'Existing invite link copied to clipboard',
      failed_create_invite_link: 'Failed to create invite link',
      invite_link_created: 'Invite link created successfully',
      invite_link_copied_to_clipboard: 'Invite link copied to clipboard',
      share_event_button: 'Share & Invite',
      edit_event_button: 'Edit Event',
      joining_event: "You're joining this event:",
      after_registration_auto_join:
        "You'll automatically join after registration",
      check_email_to_join_event:
        'Check your email to confirm and join the event!',
      registration_successful_check_email:
        'Registration successful! Check your email to confirm.',

      //EVENT INVITE PAGE

      event_invitation: 'Event Invitation',
      youve_been_invited_to: "You've been invited to",
      accept_invitation: 'Accept Invitation',
      decline_invitation: 'Decline',
      loading_invitation: 'Loading invitation...',
      invitation_expired: 'This invitation has expired',
      invitation_not_found: 'Invitation not found',
      please_login_first: 'Please login first',
      already_participant: "You're already a participant!",
      successfully_joined_event: 'Successfully joined the event!',
      failed_join_event: 'Failed to join event',
      invitation_declined: 'Invitation declined',
      processing: 'Processing...',

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
      expense_description_label: 'Expense Description',
      min_3_char: 'Minimum 3 characters',
      paid_by_label: 'Paid By',
      unknown_user: 'Unknown User',
      currency_conversion_title: 'Currency Conversion',
      currency_conversion_message:
        'This expense is in {{currency}}. The current rate is 1 {{currency}} = {{rate}} {{targetCurrency}}. This will be used for calculations. Do you confirm?',
      confirm: 'OK',
      cancel: 'Cancel',

      // EDIT EXPENSE STRINGS
      edit_expense: 'Edit Expense',
      update_expense: 'Update Expense',
      delete_expense: 'Delete Expense',

      //EXPENSES STRINGS
      all_expenses_title: 'All Expenses',
      expenses_found: 'expenses found',
      showing_last_20_expenses: 'Showing only the last 20 expenses',
      no_expenses_found: 'No expenses found yet',
      loading_expenses: 'Loading expenses...',
      passive: 'Passive',
      active: 'Active',
      authentication_error: 'Authentication error',
      failed_load_expenses: 'Failed to load expenses',
      unexpected_error: 'Unexpected error',

      //  SETTLEMENT STRINGS
      settlement_summary: 'Settlement Summary',
      your_transactions: 'Your Transactions',
      you_pay_to: 'You pay to {{name}}',
      you_receive_from: 'You receive from {{name}}',
      no_personal_transactions: 'You have no personal transactions.',
      other_transactions: 'Other Transactions',
      no_other_transactions: 'No transactions between other participants.',
      settlements_label: 'Settlements',
      view_settlements: 'View Settlements',
      settlements_label: 'Settlements',
      settlement_summary: 'Settlement Summary',
      your_transactions: 'Your Transactions',
      other_transactions: 'Other Transactions',
      no_personal_transactions: 'You have no personal transactions',
      no_other_transactions: 'No transactions between other participants',
      you_pay_to: 'You pay to {{name}}',
      you_receive_from: 'You receive from {{name}}',
      calculating_settlements: 'Calculating settlements',
      failed_load_settlements: 'Failed to load settlements',
      back: 'Back',

      //  FINANCIAL SUMMARY STRINGS
      title: '💰 My Financial Status',
      loading: 'Loading...',
      calculating: 'Calculating...',
      activeEvents_title: 'My Active Events',
      activeEvents_noEvents: 'No active events yet',
      activeEvents_eventsCount: 'active event',
      activeEvents_eventsCount_plural: 'active events',
      expectedPayments_title: 'Expected Payments',
      expectedPayments_noPayments: 'No pending payments',
      expectedPayments_currency: 'TL expected',

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
      gezgin_no_label: 'Divido No',
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
      remember_me: 'Beni Hatırla',
      login_successfull: 'Giriş Başarılı',
      forgot_password: 'Şifremi Unuttum',
      dont_have_account: 'Hesabınız Yok Mu?',
      register_instead: 'Hemen Kayıt Olun',

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
      default_currency_label: 'Harcama Para Birimi',
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
      my_events_title: 'Etkinliklerim',
      events_you_participate_in: 'Katılımcısı olduğunuz etkinlikler',
      show_passive_events: 'Pasif etkinlikleri göster',
      no_events_participated: 'Hiç etkinlik yok',
      create_first_event: 'İlk etkinliği yarat',

      //  EVENT DETAIL STRINGS
      event_details_title: 'Etkinlik Detayları',
      event_date_label: 'Etkinlik Tarihi',
      event_duration_label: 'Süre',
      event_location_label: 'Konum',
      edit_event_button: 'Düzenle',
      share_event_button: 'Paylaş',
      expenses_section_title: 'Harcamalar',
      add_expense_button: 'Harcama Ekle',
      participants_count_label: 'Katılımcılar',
      total_expenses_label: 'Toplam Giderler',
      participant: 'katılımcı',
      participants: 'katılımcı',
      participants_list_title: 'Etkinlik Katılımcıları',
      close: 'Kapat',
      no_email: 'Email adresi yok',
      loading_participants: 'Katılımcılar yükleniyor...',
      confirm_delete_event_title: 'Etkinliği Sil?',
      confirm_make_passive_title: 'Etkinliği Pasife Al?',

      //  EVENT DETAIL EDIT STRINGS
      only_admin_can_edit: 'Sadece yöneticiler bu etkinliği düzenleyebilir',
      event_participants: 'Etkinlik Katılımcıları',
      no_participants_yet: 'Henüz katılımcı yok',
      role_admin: 'Yönetici',
      role_participant: 'Katılımcı',
      joined: 'Katıldı',
      remove: 'Kaldır',
      removing: 'Kaldırılıyor...',
      cannot_remove_yourself: 'Kendinizi kaldıramazsınız',
      confirm_remove_participant:
        '{{name}} kullanıcısını etkinlikten kaldırmak istiyor musunuz?',
      participant_removed_successfully: 'Katılımcı başarıyla kaldırıldı',
      failed_remove_participant: 'Katılımcı kaldırılamadı',
      make_passive_button: 'Pasif Yap',
      delete_event_button: 'Etkinliği Sil',
      confirm_delete_event: 'Bu etkinliği silmek istediğinize emin misiniz?',
      confirm_make_passive_event:
        'Bu etkinliği pasif yapmak istediğinize emin misiniz?',
      event_deleted_successfully: 'Etkinlik başarıyla silindi',
      event_made_passive_successfully: 'Etkinlik başarıyla pasif yapıldı',
      failed_delete_event: 'Etkinlik silinemedi',
      failed_make_passive_event: 'Etkinlik pasif yapılamadı',
      back_to_event: 'Etkinliğe Geri Dön',
      failed_load_participants: 'Katılımcılar yüklenemedi',
      role_member: 'Katılımcı',
      event_description_label: 'Etkinlik Açıklaması',
      event_description_placeholder: 'Etkinliğinizi tanımlayın',

      // Invite system
      youre_invited: 'Davet Edildiniz!',
      join_event_invitation:
        'Bu etkinliğe katılın ve masrafları birlikte takip edin',
      invalid_or_expired_invitation: 'Geçersiz veya süresi dolmuş davetiye',
      invitation_not_found_or_expired: 'Davetiye bulunamadı veya süresi dolmuş',
      loading_invitation: 'Davetiye yükleniyor...',
      login_required_to_join_event:
        'Bu etkinliğe katılmak için giriş yapın veya kayıt olun',
      login_to_join: 'Etkinliğe Katılmak İçin Giriş Yap',
      register_to_join: 'Katılmak İçin Hesap Oluştur',
      join_event: 'Etkinliğe Katıl',
      joining_event: 'Katılıyor...',
      already_joined_event: 'Bu etkinliğin zaten üyesisiniz',
      successfully_joined_event: 'Etkinliğe başarıyla katıldınız!',
      failed_join_event: 'Etkinliğe katılamadı',
      please_login_to_join: 'Bu etkinliğe katılmak için giriş yapın',
      failed_process_invitation: 'Davetiye işlenemedi',
      only_admin_can_invite:
        'Sadece etkinlik yöneticileri davet linki oluşturabilir',
      existing_invite_link_copied: 'Mevcut davet linki panoya kopyalandı',
      failed_create_invite_link: 'Davet linki oluşturulamadı',
      invite_link_created: 'Davet linki başarıyla oluşturuldu',
      invite_link_copied_to_clipboard: 'Davet linki panoya kopyalandı',
      share_event_button: 'Paylaş ve Davet Et',
      edit_event_button: 'Etkinliği Düzenle',
      joining_event: 'Bu etkinliğe katılıyorsunuz:',
      after_registration_auto_join: 'Kayıt sonrası otomatik katılacaksınız',
      check_email_to_join_event:
        'E-postanızı kontrol edin ve etkinliğe katılın!',
      registration_successful_check_email:
        'Kayıt başarılı! E-postanızı kontrol edin.',

      //EVENT INVITE PAGE

      event_invitation: 'Etkinlik Davetiyesi',
      youve_been_invited_to: 'Bir etkinliğe davet edildiniz',
      accept_invitation: 'Daveti Kabul Et',
      decline_invitation: 'Reddet',
      loading_invitation: 'Davetiye yükleniyor...',
      invitation_expired: 'Bu davetiyenin süresi dolmuş',
      invitation_not_found: 'Davet bulunamadı',
      please_login_first: 'Lütfen önce giriş yapın',
      already_participant: 'Zaten bu etkinliğe katıldınız!',
      successfully_joined_event: 'Etkinliğe başarıyla katıldınız!',
      failed_join_event: 'Etkinliğe katılamadı',
      invitation_declined: 'Davet reddedildi',
      processing: 'İşleniyor...',

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
      expense_description_label: 'Harcama açıklaması',
      min_3_char: 'Minimum 3 karakter giriniz',
      paid_by_label: 'Ödeyen',
      unknown_user: 'Bilinmeyen Kullanıcı',
      currency_conversion_title: 'Kur Dönüştürme',
      currency_conversion_message:
        'Bu harcama {{currency}} cinsindendir. Güncel kur: 1 {{currency}} = {{rate}} {{targetCurrency}}. Hesaplamalarda bu kur kullanılacaktır. Onaylıyor musunuz?',
      confirm: 'Tamam',
      cancel: 'İptal',

      // EDIT EXPENSE STRINGS
      edit_expense: 'Harcamayı Düzenle',
      update_expense: 'Harcamayı Güncelle',
      delete_expense: 'Harcamayı Sil',

      //EXPENSES STRINGS
      all_expenses_title: 'Tüm Harcamalar',
      expenses_found: 'harcama bulundu',
      showing_last_20_expenses: 'Sadece son 20 harcama görüntülenmektedir',
      no_expenses_found: 'Henüz harcama bulunamadı',
      loading_expenses: 'Harcamalar yükleniyor...',
      passive: 'Pasif',
      active: 'Aktif',
      authentication_error: 'Kimlik doğrulama hatası',
      failed_load_expenses: 'Harcamalar yüklenemedi',
      unexpected_error: 'Beklenmeyen hata',

      //  SETTLEMENT STRINGS
      settlement_summary: 'Hesaplaşma Özeti',
      your_transactions: 'Senin İşlemlerin',
      you_pay_to: '{{name}} kişisine ödeme yapacaksın',
      you_receive_from: '{{name}} kişisinden ödeme alacaksın',
      no_personal_transactions: 'Kişisel işleminiz yok.',
      other_transactions: 'Diğer İşlemler',
      no_other_transactions: 'Diğer katılımcılar arasında işlem yok.',
      settlements_label: 'Ödemeler',
      view_settlements: 'Ödemeleri Gör',
      settlements_label: 'Ödemeler',
      settlement_summary: 'Ödeme Özeti',
      your_transactions: 'Senin İşlemlerin',
      other_transactions: 'Diğer İşlemler',
      no_personal_transactions: 'Henüz bir ödemen yok',
      no_other_transactions: 'Başka işlem yok',
      you_pay_to: '{{name}} kişisine ödeyeceksin',
      you_receive_from: '{{name}} kişisinden alacaksın',
      calculating_settlements: 'Hesaplar hesaplanıyor',
      failed_load_settlements: 'Hesaplar yüklenemedi',
      back: 'Geri',

      //  FINANCIAL SUMMARY STRINGS
      title: '💰 Mali Durumum',
      loading: 'Yükleniyor...',
      calculating: 'Hesaplanıyor...',
      activeEvents_title: 'Açık Etkinliklerim',
      activeEvents_noEvents: 'Henüz aktif etkinlik yok',
      activeEvents_eventsCount: 'aktif etkinlik',
      activeEvents_eventsCount_plural: 'aktif etkinlik',
      expectedPayments_title: 'Beklediğim Ödemeler',
      expectedPayments_noPayments: 'Bekleyen ödeme yok',
      expectedPayments_currency: 'TL alacağım',

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
