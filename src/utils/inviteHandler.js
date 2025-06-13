// ✅ src/utils/inviteHandler.js
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export const handlePendingInvitation = async (t) => {
  try {
    const pendingToken = localStorage.getItem('pendingInviteToken');

    if (!pendingToken) {
      return null; // Bekleyen davet yok
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return null; // Kullanıcı login değil
    }

    console.log('Processing pending invitation with token:', pendingToken);

    // Token ile davetiyeyi bul
    const { data: invitation, error: inviteError } = await supabase
      .from('event_invitations')
      .select(
        `
        id,
        event_id,
        status,
        expires_at,
        event:events(name)
      `
      )
      .eq('token', pendingToken)
      .eq('status', 'pending')
      .gte('expires_at', new Date().toISOString())
      .single();

    if (inviteError || !invitation) {
      console.error('Invalid or expired invitation:', inviteError);
      localStorage.removeItem('pendingInviteToken');
      toast.error(t('invalid_or_expired_invitation'));
      return null;
    }

    // Kullanıcı zaten katılımcı mı kontrol et
    const { data: existingParticipant } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', invitation.event_id)
      .eq('user_id', user.id)
      .single();

    if (existingParticipant) {
      localStorage.removeItem('pendingInviteToken');
      toast.success(t('already_joined_event'));
      return `/events/${invitation.event_id}`;
    }

    // Katılımcı olarak ekle
    const { error: participantError } = await supabase
      .from('event_participants')
      .insert([
        {
          event_id: invitation.event_id,
          user_id: user.id,
          role: 'member',
          status: 'active',
          joined_at: new Date().toISOString()
        }
      ]);

    if (participantError) {
      console.error('Error adding participant:', participantError);
      toast.error(t('failed_join_event'));
      return null;
    }

    // Davetiyeyi kullanıldı olarak işaretle
    const { error: inviteUpdateError } = await supabase
      .from('event_invitations')
      .update({
        status: 'accepted',
        used_at: new Date().toISOString(),
        used_by: user.id
      })
      .eq('id', invitation.id);

    if (inviteUpdateError) {
      console.error('Error updating invitation:', inviteUpdateError);
    }

    // Token'ı temizle
    localStorage.removeItem('pendingInviteToken');

    toast.success(t('successfully_joined_event'));

    // Event sayfasına yönlendirme URL'si döndür
    return `/events/${invitation.event_id}`;
  } catch (error) {
    console.error('Error handling pending invitation:', error);
    localStorage.removeItem('pendingInviteToken');
    toast.error(t('failed_process_invitation'));
    return null;
  }
};
