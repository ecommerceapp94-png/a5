import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '@/theme/ThemeContext';
import { AppBottomSheet } from '@/components/BottomSheetModal';
import { useAIAssistant } from '@/components/ai/AIAssistantContext';
import { AI_SAMPLE_QUESTIONS } from '@/components/ai/aiResponses';
import { TagChip } from '@/components/TagChip';
import { PressableScale } from '@/components/PressableScale';
import { AvatarBadge } from '@/components/AvatarBadge';
import { formatRelativeTime } from '@/utils/format';
import { AIMessage } from '@/types';

export const AIAssistantSheet: React.FC = () => {
  const { theme } = useTheme();
  const { open, hide, messages, send, sending, clear } = useAIAssistant();
  const [draft, setDraft] = useState('');

  const handleSend = useCallback(async () => {
    const text = draft.trim();
    if (!text) {
      Toast.show({ type: 'info', text1: 'Type a question to start' });
      return;
    }
    setDraft('');
    await send(text);
  }, [draft, send]);

  const renderMessage = ({ item }: { item: AIMessage }) => {
    const mine = item.role === 'user';
    return (
      <View
        style={[
          styles.messageRow,
          { justifyContent: mine ? 'flex-end' : 'flex-start' },
        ]}
      >
        {!mine ? (
          <AvatarBadge label="AI" variant="cosmic" size={32} style={{ marginRight: 8 }} />
        ) : null}
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: mine ? theme.colors.primary : theme.colors.surfaceAlt,
              borderTopLeftRadius: mine ? theme.radius.lg : 4,
              borderTopRightRadius: mine ? 4 : theme.radius.lg,
              borderBottomLeftRadius: theme.radius.lg,
              borderBottomRightRadius: theme.radius.lg,
            },
          ]}
        >
          <Text style={{ color: mine ? theme.colors.textInverse : theme.colors.text, lineHeight: 20 }}>
            {item.text}
          </Text>
          <Text
            style={{
              marginTop: 6,
              color: mine ? theme.colors.textInverse : theme.colors.textMuted,
              opacity: mine ? 0.75 : 1,
              fontSize: 11,
            }}
          >
            {formatRelativeTime(item.createdAt)}
          </Text>
        </View>
        {mine ? (
          <AvatarBadge label="ME" variant="brand" size={32} style={{ marginLeft: 8 }} />
        ) : null}
      </View>
    );
  };

  return (
    <AppBottomSheet
      open={open}
      onClose={hide}
      title="Elite AI"
      description={sending ? 'Thinking…' : 'Ask anything about your browsing.'}
      snapPoints={['55%', '92%']}
    >
      <View style={styles.suggestionsRow}>
        {AI_SAMPLE_QUESTIONS.slice(0, 6).map((q) => (
          <TagChip
            key={q}
            label={q.toLowerCase().split(' ').slice(0, 2).join('-')}
            tone="info"
            onPress={() => send(q)}
          />
        ))}
      </View>
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingVertical: 12 }}
        showsVerticalScrollIndicator={false}
      />
      <View
        style={[
          styles.inputRow,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Ask Elite anything…"
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.input, { color: theme.colors.text }]}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <PressableScale haptic="selection" onPress={clear} style={styles.iconButton}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.textMuted} />
        </PressableScale>
        <PressableScale
          haptic="medium"
          onPress={handleSend}
          style={[styles.iconButton, { backgroundColor: theme.colors.primary }]}
        >
          <Ionicons name="paper-plane" size={18} color={theme.colors.textInverse} />
        </PressableScale>
      </View>
    </AppBottomSheet>
  );
};

const styles = StyleSheet.create({
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 6,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 6,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
});
