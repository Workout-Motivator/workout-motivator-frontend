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
import { auth, db } from '../firebaseConfig';
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
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(() => {
    // Try to get the last selected partner from localStorage
    return localStorage.getItem('lastSelectedPartnerId');
  });
  const [unreadMessages, setUnreadMessages] = useState<{[key: string]: number}>({});
  const [messages, setMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const unreadMessageListeners = useRef<{[key: string]: () => void}>( {});

  const selectedPartner = useMemo(() => 
    partners.find(p => p.id === selectedPartnerId) || null
  , [partners, selectedPartnerId]);

  // Save selected partner to localStorage whenever it changes
  useEffect(() => {
    if (selectedPartnerId) {
      localStorage.setItem('lastSelectedPartnerId', selectedPartnerId);
    }
  }, [selectedPartnerId]);

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

      // If we have a stored partnerId but that partner no longer exists,
      // clear the stored value
      if (selectedPartnerId && !partnersList.some(p => p.id === selectedPartnerId)) {
        localStorage.removeItem('lastSelectedPartnerId');
        setSelectedPartnerId(null);
      }
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
      // Reverse the messages to show newest at the bottom
      const sortedMsgs = [...msgs].reverse();
      setMessages(prev => ({
        ...prev,
        [selectedPartnerId]: sortedMsgs
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
    } catch (error) {
      if (error instanceof Error && error.message !== 'permission-denied') {
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
    <Box sx={{ 
      display: 'grid',
      gridTemplateColumns: '280px 1fr',
      gap: 0,
      height: 'calc(100vh - 200px)',
      minHeight: '600px',
      bgcolor: '#1E1E1E',
      color: 'white',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '4px',
    }}>
      <Box sx={{ 
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        bgcolor: '#1E1E1E',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Typography variant="h6" sx={{ p: 2, color: 'white', flexShrink: 0 }}>
          Chat Partners
        </Typography>
        <List sx={{ 
          flex: 1,
          overflow: 'auto',
          '& .MuiListItem-root': {
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          },
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#1E1E1E',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#2A2A2A',
            borderRadius: '4px',
            '&:hover': {
              background: '#363636',
            },
          },
        }}>
          {partners.map((partner) => (
            <ListItem
              key={partner.id}
              button
              selected={selectedPartnerId === partner.id}
              onClick={() => setSelectedPartnerId(partner.id)}
              sx={{
                '&.Mui-selected': {
                  bgcolor: '#2A2A2A',
                  '&:hover': {
                    bgcolor: '#2A2A2A',
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ 
                  bgcolor: '#00FF7F',
                  color: 'black',
                }}>
                  {partner.username[0].toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary={partner.username}
                sx={{
                  '& .MuiListItemText-primary': {
                    color: 'white',
                  },
                }}
              />
              {unreadMessages[partner.id] > 0 && (
                <Badge
                  badgeContent={unreadMessages[partner.id]}
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: '#00FF7F',
                      color: 'black',
                    },
                  }}
                />
              )}
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {selectedPartner ? (
          <Chat
            partnerId={selectedPartner.id}
            partnerName={selectedPartner.username}
            messages={messages[selectedPartner.id] || []}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: 'rgba(255, 255, 255, 0.5)',
          }}>
            <Typography variant="h6">Select a chat partner to start messaging</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatRoom;
