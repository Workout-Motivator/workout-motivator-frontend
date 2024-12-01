import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Paper,
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
      // Cleanup any existing unread message listeners
      Object.values(unreadMessageListeners.current).forEach(unsubscribe => unsubscribe());
    };
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Cleanup previous listeners
    Object.values(unreadMessageListeners.current).forEach(unsubscribe => unsubscribe());
    unreadMessageListeners.current = {};

    // Setup new listeners for each partner
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
      // Update both states synchronously
      setSelectedPartnerId(partner.id);
      setUnreadMessages(prev => ({
        ...prev,
        [partner.id]: 0
      }));

      if (!auth.currentUser) return;

      // Mark messages as read in background
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
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* Partners List */}
      <Paper sx={{ width: 300, overflow: 'auto', borderRadius: 0 }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Chat with Partners
        </Typography>
        <Divider />
        <List>
          {partners.map((partner) => (
            <ListItem
              key={partner.id}
              button
              selected={selectedPartnerId === partner.id}
              onClick={() => handlePartnerSelect(partner)}
              sx={{
                bgcolor: selectedPartnerId === partner.id ? 'action.selected' : 'inherit',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar>{partner.username[0].toUpperCase()}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={partner.username} />
              {unreadMessages[partner.id] > 0 && (
                <Badge badgeContent={unreadMessages[partner.id]} color="primary" />
              )}
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Chat Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedPartner && selectedPartnerId ? (
          <Chat 
            partnerId={selectedPartner.id}
            partnerName={selectedPartner.username}
            messages={messages[selectedPartnerId] || []}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="h6" color="textSecondary">
              Select a partner to start chatting
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatRoom;
