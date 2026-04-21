import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useAppPreferences } from '@/contexts/AppPreferencesContext';
import { ApiService } from '@/services/api';

type ChatItem = {
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageAt?: string | null;
};

export default function ChatsInboxScreen() {
  const router = useRouter();
  const { shop } = useAuth();
  const { t } = useAppPreferences();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [chats, setChats] = useState<ChatItem[]>([]);

  const load = useCallback(async () => {
    if (!shop?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const data = await ApiService.getMerchantChats(String(shop.id));
      const normalized: ChatItem[] = (Array.isArray(data) ? data : []).map((c: any) => ({
        userId: String(c?.userId || c?.user_id || ''),
        userName: String(c?.userName || c?.user_name || t('chats.customer')),
        lastMessage: String(c?.lastMessage || c?.last_message || ''),
        lastMessageAt: c?.lastMessageAt || c?.last_message_at || null,
      })).filter((c) => Boolean(c.userId));
      setChats(normalized);
    } catch {
      setChats([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shop?.id]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) => c.userName.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q));
  }, [chats, query]);

  if (loading) {
    return (
      <View style={s.center}>
        <Stack.Screen options={{ title: t('more.chats') }} />
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Stack.Screen options={{ title: t('more.chats') }} />

      <View style={s.searchWrap}>
        <Ionicons name="search-outline" size={18} color="#94A3B8" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('chats.search')}
          placeholderTextColor="#94A3B8"
          style={s.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={filtered.length === 0 ? s.empty : s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#00E5FF" />}
      >
        {filtered.length === 0 ? (
          <View style={s.emptyBox}>
            <Ionicons name="chatbubbles-outline" size={52} color="#CBD5E1" />
            <Text style={s.emptyTitle}>{t('chats.emptyTitle')}</Text>
            <Text style={s.emptySub}>{t('chats.emptySub')}</Text>
          </View>
        ) : (
          filtered.map((c) => (
            <TouchableOpacity
              key={c.userId}
              style={s.chatRow}
              onPress={() => router.push({ pathname: '/more/chats/[userId]', params: { userId: c.userId, userName: c.userName } } as any)}
            >
              <View style={s.avatar}>
                <Ionicons name="person" size={18} color="#0F172A" />
              </View>
              <View style={s.chatMid}>
                <Text style={s.chatName} numberOfLines={1}>{c.userName}</Text>
                <Text style={s.chatLast} numberOfLines={1}>{c.lastMessage || t('chats.noMessages')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  scroll: { flex: 1 },

  searchWrap: {
    margin: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '700', color: '#0F172A' },

  list: { paddingHorizontal: 16, paddingBottom: 24 },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#E0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFEFFF',
  },
  chatMid: { flex: 1 },
  chatName: { fontSize: 14, fontWeight: '900', color: '#0F172A' },
  chatLast: { fontSize: 12, fontWeight: '700', color: '#64748B', marginTop: 2 },

  empty: { flexGrow: 1, padding: 16 },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: '#0F172A', marginTop: 6 },
  emptySub: { fontSize: 13, fontWeight: '700', color: '#64748B', textAlign: 'center' },
});
