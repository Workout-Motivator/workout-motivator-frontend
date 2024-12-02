import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  Divider,
} from '@mui/material';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  setDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import Chat from './Chat';
import { ChatMessage, Partner } from '../types/chat';

const ChatRoom: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [unreadMessages, setUnreadMessages] = useState<{[key: string]: number}>({});
  const [messages, setMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const unreadMessageListeners = useRef<{[key: string]: () => void}>({});

  const selectedPartner = useMemo(() => 
    partners.find(p => p.id === selectedPartnerId) || null
  , [partners, selectedPartnerId]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const partnersQuery = query(
      collection(db, 'partnerships'),
      where('participants', 'array-contains', auth.currentUser.email)
    );

    const unsubscribePartners = onSnapshot(partnersQuery, (snapshot) => {
      const partnersList: Partner[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const partnerEmail = data.participants.find(
          (email: string) => email !== auth.currentUser?.email
        );
        
        const newPartner: Partner = {
          id: doc.id,
          email: partnerEmail || '',
          username: data.usernames?.[partnerEmail] || partnerEmail || 'Unknown',
          status: 'accepted' as const,
        };
        partnersList.push(newPartner);
      });
      setPartners(partnersList);
    });

    return () => {
      unsubscribePartners();
      Object.values(unreadMessageListeners.current).forEach(unsubscribe => unsubscribe());
    };
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;

    Object.values(unreadMessageListeners.current).forEach(unsubscribe => unsubscribe());
    unreadMessageListeners.current = {};

    partners.forEach(partner => {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('partnerId', '==', partner.id),
        where('uid', '!=', auth.currentUser!.uid),
        where('read', '==', false)
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        setUnreadMessages(prev => ({
          ...prev,
          [partner.id]: snapshot.size
        }));
      });

      unreadMessageListeners.current[partner.id] = unsubscribe;
    });

    return () => {
      Object.values(unreadMessageListeners.current).forEach(unsubscribe => unsubscribe());
    };
  }, [partners]);

  useEffect(() => {
    if (!auth.currentUser || !selectedPartnerId) return;

    const messagesQuery = query(
      collection(db, 'messages'),
      where('partnerId', '==', selectedPartnerId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.uid !== auth.currentUser?.uid && !data.read) {
          setDoc(doc.ref, { read: true }, { merge: true }).catch(error => {
            if (error.code === 'permission-denied') {
              console.warn('Unable to mark message as read');
            }
          });
        }
        msgs.push({ id: doc.id, ...data } as ChatMessage);
      });
      setMessages(prev => ({
        ...prev,
        [selectedPartnerId]: msgs.reverse()
      }));
    });

    return () => unsubscribe();
  }, [selectedPartnerId]);

  const handlePartnerSelect = async (partner: Partner) => {
    try {
      setSelectedPartnerId(partner.id);
      setUnreadMessages(prev => ({
        ...prev,
        [partner.id]: 0
      }));

      if (!auth.currentUser) return;

      const messagesQuery = query(
        collection(db, 'messages'),
        where('partnerId', '==', partner.id),
        where('uid', '!=', auth.currentUser.uid),
        where('read', '==', false)
      );

      const snapshot = await getDocs(messagesQuery);
      if (snapshot.empty) return;

      const batch = writeBatch(db);
      snapshot.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();
    } catch (error: any) {
      if (error.code !== 'permission-denied') {
        console.error('Error handling partner selection:', error);
      }
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!auth.currentUser || !selectedPartnerId || !text.trim()) return;

    try {
      const messageData = {
        text: text.trim(),
        createdAt: serverTimestamp(),
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName || 'Anonymous',
        partnerId: selectedPartnerId,
        read: false,
      };

      await addDoc(collection(db, 'messages'), messageData);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: 2,
        height: 'calc(100vh - 200px)',
        minHeight: '600px',
        bgcolor: 'background.paper',
        border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          borderRight: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
          overflowY: 'auto',
          height: '100%',
        }}
      >
        <Typography variant="h6" sx={{ p: 2, borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}` }}>
          Chat Partners
        </Typography>
        <List sx={{ p: 0 }}>
          {partners.map((partner) => (
            <ListItem
              key={partner.id}
              onClick={() => handlePartnerSelect(partner)}
              sx={{
                cursor: 'pointer',
                bgcolor: selectedPartnerId === partner.id 
                  ? (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.08)' 
                    : 'rgba(0, 0, 0, 0.04)'
                  : 'transparent',
                '&:hover': {
                  bgcolor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.08)' 
                    : 'rgba(0, 0, 0, 0.04)',
                },
                borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 40,
                    height: 40,
                    borderRadius: '4px',
                  }}
                >
                  {partner.username.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={partner.username}
                sx={{
                  '& .MuiListItemText-primary': {
                    color: 'text.primary',
                    fontWeight: 500,
                  },
                }}
              />
              {unreadMessages[partner.id] > 0 && (
                <Box
                  sx={{
                    minWidth: 20,
                    height: 20,
                    borderRadius: '10px',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    ml: 1,
                  }}
                >
                  {unreadMessages[partner.id]}
                </Box>
              )}
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        {selectedPartner ? (
          <Chat
            partnerId={selectedPartner.id}
            partnerName={selectedPartner.username}
            messages={messages[selectedPartner.id] || []}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
              borderRadius: '4px',
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Select a partner to start chatting
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatRoom;
