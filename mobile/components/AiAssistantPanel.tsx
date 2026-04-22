import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: Array<{ type: string; payload: any; confirmed: boolean }>;
}

interface AiAssistantPanelProps {
  shopId: string;
  shop?: any;
  currentPage?: string;
  onActionExecuted?: () => void;
}

const QUICK_ACTIONS = [
  { key: 'ai.quickActions.changeColor', prompt: 'غيّر اللون الأساسي إلى أزرق' },
  { key: 'ai.quickActions.toggleReservations', prompt: 'فعّل نظام الحجوزات' },
  { key: 'ai.quickActions.shopStatus', prompt: 'إيه حالة المحل دلوقتي؟' },
];

const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({
  shopId,
  shop,
  currentPage,
  onActionExecuted,
}) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const aiTier = (shop?.aiTier || shop?.ai_tier || 'FREE').toUpperCase();

  useEffect(() => {
    if (isOpen && flatListRef.current) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    setInput('');

    const userMsg: AiMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await ApiService.aiChat({
        message: text,
        shopId,
        context: {
          currentPage: currentPage || 'dashboard',
          locale: isArabic ? 'ar' : 'en',
        },
      });

      const assistantMsg: AiMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response?.reply || t('ai.noResponse'),
        actions: response?.actions || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (response?.actions?.some((a: any) => a.confirmed) && onActionExecuted) {
        onActionExecuted();
      }
    } catch (err: any) {
      const errorMsg: AiMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: err?.message || t('ai.errorOccurred'),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const tierLabel = aiTier === 'ENTERPRISE' ? t('ai.tierEnterprise') : aiTier === 'PRO' ? t('ai.tierPro') : t('ai.tierFree');

  const renderMessage = ({ item }: { item: AiMessage }) => (
    <View style={[styles.msgRow, item.role === 'user' && styles.msgRowUser]}>
      <View style={[styles.avatar, item.role === 'assistant' ? styles.avatarAi : styles.avatarUser]}>
        <Ionicons
          name={item.role === 'assistant' ? 'sparkles' : 'person'}
          size={14}
          color={item.role === 'assistant' ? '#0891B2' : '#fff'}
        />
      </View>
      <View
        style={[
          styles.msgBubble,
          item.role === 'assistant' ? styles.msgBubbleAi : styles.msgBubbleUser,
        ]}
      >
        <Text style={[styles.msgText, item.role === 'user' && styles.msgTextUser]}>
          {item.content}
        </Text>
        {item.actions && item.actions.length > 0 && (
          <View style={styles.actionsContainer}>
            {item.actions.map((action, idx) => (
              <View
                key={idx}
                style={[styles.actionBadge, action.confirmed ? styles.actionSuccess : styles.actionFail]}
              >
                <Ionicons
                  name={action.confirmed ? 'checkmark-circle' : 'close-circle'}
                  size={12}
                  color={action.confirmed ? '#16A34A' : '#EF4444'}
                />
                <Text style={[styles.actionText, { color: action.confirmed ? '#16A34A' : '#EF4444' }]}>
                  {action.type}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  if (!isOpen) {
    return (
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="sparkles" size={24} color="#fff" />
        {messages.length === 0 && <View style={styles.fabDot} />}
      </TouchableOpacity>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.panel}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons name="sparkles" size={16} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>{t('ai.assistantTitle')}</Text>
            <Text style={styles.headerTier}>{tierLabel}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="sparkles-outline" size={32} color="#0891B2" />
          </View>
          <Text style={styles.emptyTitle}>{t('ai.welcomeTitle')}</Text>
          <Text style={styles.emptySubtitle}>{t('ai.welcomeSubtitle')}</Text>
          <View style={styles.quickActions}>
            {QUICK_ACTIONS.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.quickBtn}
                onPress={() => handleSend(action.prompt)}
              >
                <Text style={styles.quickBtnText}>{t(action.key)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingRow}>
          <View style={styles.avatarAi}>
            <Ionicons name="sparkles" size={14} color="#0891B2" />
          </View>
          <View style={styles.loadingBubble}>
            <Ionicons name="reload" size={14} color="#0891B2" />
            <Text style={styles.loadingText}>{t('ai.thinking')}</Text>
          </View>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={t('ai.inputPlaceholder')}
          placeholderTextColor="#94A3B8"
          editable={!isLoading}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
          onPress={() => handleSend()}
          disabled={isLoading || !input.trim()}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {aiTier === 'FREE' && (
        <Text style={styles.freeTierHint}>{t('ai.freeTierHint')}</Text>
      )}
    </KeyboardAvoidingView>
  );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0891B2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0891B2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4ADE80',
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.65,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0891B2',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  headerTier: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#ECFEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    justifyContent: 'center',
  },
  quickBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  msgRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  msgRowUser: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  avatarAi: {
    backgroundColor: '#ECFEFF',
  },
  avatarUser: {
    backgroundColor: '#1E293B',
  },
  msgBubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  msgBubbleAi: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  msgBubbleUser: {
    backgroundColor: '#0891B2',
  },
  msgText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#334155',
  },
  msgTextUser: {
    color: '#fff',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionSuccess: {
    backgroundColor: '#F0FDF4',
  },
  actionFail: {
    backgroundColor: '#FEF2F2',
  },
  actionText: {
    fontSize: 10,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  loadingText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 14,
    color: '#334155',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: '#0891B2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  freeTierHint: {
    textAlign: 'center',
    fontSize: 10,
    color: '#CBD5E1',
    paddingBottom: 8,
  },
});

export default AiAssistantPanel;
