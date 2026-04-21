import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useAppPreferences } from '@/contexts/AppPreferencesContext';
import { ApiService } from '@/services/api';

type ChatMessage = {
  id: string;
  content: string;
  role: 'CUSTOMER' | 'MERCHANT' | string;
  createdAt?: string;
  senderName?: string;
};

export default function ChatThreadScreen() {
  const { shop, user } = useAuth();
  const { t } = useAppPreferences();
  const params = useLocalSearchParams<{ userId: string; userName?: string }>();

  const userId = String(params.userId || '').trim();
  const title = String(params.userName || t('chats.chat'));

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const scrollRef = useRef<ScrollView | null>(null);

  const load = useCallback(async () => {
    if (!shop?.id || !userId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const data = await ApiService.getChatMessages(String(shop.id), userId);
      const normalized: ChatMessage[] = (Array.isArray(data) ? data : []).map((m: any) => ({
        id: String(m?.id || ''),
        content: String(m?.content || ''),
        role: String(m?.role || ''),
        createdAt: m?.createdAt || m?.created_at,
        senderName: m?.senderName || m?.sender_name,
      })).filter((m) => Boolean(m.id));
      setMessages(normalized);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [shop?.id, userId]);

  useEffect(() => { load(); }, [load]);

  const send = useCallback(async () => {
    if (!shop?.id || !userId) return;
    const content = text.trim();
    if (!content) return;

    setSending(true);
    try {
      const created = await ApiService.sendChatMessage(String(shop.id), userId, content);
      const myName = String((user as any)?.name || (user as any)?.email || 'Merchant');
      const optimistic: ChatMessage = {
        id: String(created?.id || Date.now()),
        content: String(created?.content || content),
        role: String(created?.role || 'MERCHANT'),
        createdAt: created?.createdAt || new Date().toISOString(),
        senderName: created?.senderName || myName,
      };
      setMessages((prev) => prev.concat([optimistic]));
      setText('');
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    } catch {
      // keep input
    } finally {
      setSending(false);
    }
  }, [shop?.id, userId, text]);

  const grouped = useMemo(() => messages, [messages]);

  if (loading) {
    return (
      <View style={s.center}>
        <Stack.Screen options={{ title }} />
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={110}>
      <Stack.Screen options={{ title }} />

      <ScrollView
        ref={(r) => { scrollRef.current = r; }}
        style={s.scroll}
        contentContainerStyle={grouped.length === 0 ? s.empty : s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#00E5FF" />}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {grouped.length === 0 ? (
          <View style={s.emptyBox}>
            <Ionicons name="chatbubble-ellipses-outline" size={52} color="#CBD5E1" />
            <Text style={s.emptyTitle}>{t('chats.threadEmptyTitle')}</Text>
            <Text style={s.emptySub}>{t('chats.threadEmptySub')}</Text>
          </View>
        ) : (
          grouped.map((m) => {
            const isMe = String(m.role).toUpperCase() === 'MERCHANT';
            return (
              <View key={m.id} style={[s.msgRow, isMe ? s.msgRowMe : s.msgRowOther]}>
                <View style={[s.bubble, isMe ? s.bubbleMe : s.bubbleOther]}>
                  <Text style={[s.msgText, isMe ? s.msgTextMe : s.msgTextOther]}>{m.content}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={s.inputBar}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={t('chats.typeMessage')}
          placeholderTextColor="#94A3B8"
          style={s.input}
          multiline
        />
        <TouchableOpacity style={[s.sendBtn, sending && s.sendBtnDisabled]} onPress={send} disabled={sending}>
          <Ionicons name="send" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  scroll: { flex: 1 },

  list: { padding: 16, paddingBottom: 24, gap: 10 },
  msgRow: { flexDirection: 'row' },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },

  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
  },
  bubbleMe: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  bubbleOther: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  msgText: { fontSize: 14, fontWeight: '700' },
  msgTextMe: { color: '#FFFFFF' },
  msgTextOther: { color: '#0F172A' },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#00E5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.6 },

  empty: { flexGrow: 1, padding: 16 },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: '#0F172A', marginTop: 6 },
  emptySub: { fontSize: 13, fontWeight: '700', color: '#64748B', textAlign: 'center' },
});
