import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Alert,
  IconButton,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Skeleton,
} from '@mui/material';
import { db, auth } from '../firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  serverTimestamp,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';

interface Partner {
  id: string;
  email: string;
  username: string;
  status: 'pending' | 'accepted';
}

interface PartnerRequest {
  id: string;
  fromEmail: string;
  fromUsername: string;
  createdAt: Date | { seconds: number; nanoseconds: number } | null;
}

interface DeleteDialogProps {
  open: boolean;
  partner: Partner | null;
  onClose: () => void;
  onConfirm: () => void;
}

interface AccountabilityPartnerProps {
  onTabChange?: (tabIndex: number) => void;
}

const DeletePartnerDialog: React.FC<DeleteDialogProps> = ({ open, partner, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle sx={{ pb: 1 }}>Delete Partner</DialogTitle>
    <DialogContent>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography>
          Are you sure you want to remove this accountability partner?
        </Typography>
        <Box sx={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.04)', 
          p: 2, 
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5
        }}>
          <Typography variant="h6" component="div" sx={{ color: 'primary.main' }}>
            {partner?.username}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {partner?.email}
          </Typography>
        </Box>
        <Typography color="error.main" variant="body2">
          This action cannot be undone.
        </Typography>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onConfirm} color="error" variant="contained">
        Delete Partner
      </Button>
    </DialogActions>
  </Dialog>
);

export const AccountabilityPartner: React.FC<AccountabilityPartnerProps> = ({ onTabChange }) => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{open: boolean; partner: Partner | null}>({
    open: false,
    partner: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    setLoading(true);
    // Listen for partner requests
    const requestsQuery = query(
      collection(db, 'partnerRequests'),
      where('toEmail', '==', auth.currentUser.email)
    );

    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      const requestsList: PartnerRequest[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        requestsList.push({
          id: doc.id,
          fromEmail: data.fromEmail,
          fromUsername: data.fromUsername,
          createdAt: data.createdAt,
        });
      });
      setRequests(requestsList);
    });

    // Listen for accepted partners
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
        partnersList.push({
          id: doc.id,
          email: partnerEmail,
          username: data.usernames[partnerEmail] || partnerEmail,
          status: 'accepted',
        });
      });
      setPartners(partnersList);
      setLoading(false);
    });

    return () => {
      unsubscribeRequests();
      unsubscribePartners();
    };
  }, []);

  const handleAddPartner = async () => {
    if (!auth.currentUser || !partnerEmail) return;
    setError(null);

    try {
      // Check if user exists
      const userQuery = query(
        collection(db, 'users'),
        where('email', '==', partnerEmail)
      );
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        setError('User not found. They need to sign in first.');
        return;
      }

      // Check if request already exists
      const existingRequestQuery = query(
        collection(db, 'partnerRequests'),
        where('fromEmail', '==', auth.currentUser.email),
        where('toEmail', '==', partnerEmail)
      );
      const existingRequestSnapshot = await getDocs(existingRequestQuery);

      if (!existingRequestSnapshot.empty) {
        setError('You have already sent a request to this user.');
        return;
      }

      // Check if partnership already exists
      const existingPartnershipQuery = query(
        collection(db, 'partnerships'),
        where('participants', 'array-contains', auth.currentUser.email)
      );
      const existingPartnershipSnapshot = await getDocs(existingPartnershipQuery);
      
      const alreadyPartners = existingPartnershipSnapshot.docs.some(doc => {
        const data = doc.data();
        return data.participants.includes(partnerEmail);
      });

      if (alreadyPartners) {
        setError('You are already partners with this user.');
        return;
      }

      // Create partner request
      await addDoc(collection(db, 'partnerRequests'), {
        fromEmail: auth.currentUser.email,
        fromUsername: auth.currentUser.displayName || auth.currentUser.email,
        toEmail: partnerEmail,
        createdAt: serverTimestamp(),
        status: 'pending'
      });

      setOpenDialog(false);
      setPartnerEmail('');
    } catch (error) {
      console.error('Error adding partner:', error);
      setError('Error sending partner request');
    }
  };

  const handleAcceptRequest = async (request: PartnerRequest) => {
    if (!auth.currentUser?.email) return;

    try {
      const currentUserEmail = auth.currentUser.email;
      // Create partnership
      await addDoc(collection(db, 'partnerships'), {
        participants: [currentUserEmail, request.fromEmail],
        usernames: {
          [currentUserEmail as string]: auth.currentUser.displayName || currentUserEmail,
          [request.fromEmail]: request.fromUsername
        },
        createdAt: serverTimestamp()
      });

      // Delete request
      await deleteDoc(doc(db, 'partnerRequests', request.id));
    } catch (error) {
      console.error('Error accepting request:', error);
      setError('Error accepting partner request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, 'partnerRequests', requestId));
    } catch (error) {
      console.error('Error rejecting request:', error);
      setError('Error rejecting partner request');
    }
  };

  const handleDeletePartner = async (partner: Partner) => {
    setDeleteDialog({ open: true, partner });
  };

  const confirmDeletePartner = async () => {
    if (!deleteDialog.partner) return;

    try {
      await deleteDoc(doc(db, 'partnerships', deleteDialog.partner.id));
      setDeleteDialog({ open: false, partner: null });
    } catch (error) {
      console.error('Error deleting partner:', error);
      setError('Error deleting partner');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Partners" />
          <Tab label={`Requests (${requests.length})`} />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {tabValue === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Partners List */}
          <Box>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
              Your Partners
            </Typography>
            {loading ? (
              <Grid container spacing={2}>
                {[1, 2, 3].map((key) => (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Skeleton variant="circular" width={56} height={56} sx={{ mr: 2 }} />
                          <Box sx={{ width: '100%' }}>
                            <Skeleton variant="text" width="80%" height={32} />
                            <Skeleton variant="text" width="60%" />
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Skeleton variant="rectangular" height={36} sx={{ flex: 2 }} />
                          <Skeleton variant="rectangular" width={50} height={36} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : partners.length === 0 ? (
              <Paper 
                sx={{ 
                  p: 3, 
                  bgcolor: 'background.paper',
                  textAlign: 'center',
                  border: theme => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography color="text.primary">
                  You don't have any partners yet. Add a partner to get started!
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {partners.map((partner) => (
                  <Grid item xs={12} sm={6} md={4} key={partner.id}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                        }
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            sx={{ 
                              width: 56, 
                              height: 56, 
                              bgcolor: 'primary.main',
                              fontSize: '1.5rem',
                              mr: 2
                            }}
                          >
                            {partner.username.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                              {partner.username}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {partner.email}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            variant="contained" 
                            color="primary"
                            fullWidth
                            onClick={() => {
                              // Store the partner ID for auto-opening in chat
                              localStorage.setItem('lastSelectedPartnerId', partner.id);
                              navigate('/chat');
                            }}
                            sx={{ 
                              flex: 2,
                              textTransform: 'none',
                              fontWeight: 500
                            }}
                          >
                            Chat
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => setDeleteDialog({ open: true, partner })}
                            sx={{ 
                              minWidth: '50px',
                              width: '50px',
                              height: '100%',
                              p: 1,
                              '&:hover': {
                                bgcolor: 'error.dark',
                              }
                            }}
                          >
                            <DeleteIcon />
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* Add Partner Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenDialog(true)}
            sx={{
              py: 1.5,
              width: 'fit-content',
              alignSelf: 'flex-start',
              borderRadius: 2,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
              }
            }}
            data-testid="add-partner-button"
          >
            Add Partner
          </Button>

          {/* Partner Requests */}
          {requests.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                Partner Requests
              </Typography>
              <Grid container spacing={2}>
                {requests.map((request) => (
                  <Grid item xs={12} sm={6} md={4} key={request.id}>
                    <Card sx={{ 
                      height: '100%',
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText'
                    }}>
                      <CardContent>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h6" component="div">
                            {request.fromUsername}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            {request.fromEmail}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            color="success"
                            fullWidth
                            onClick={() => handleAcceptRequest(request)}
                            sx={{ 
                              bgcolor: 'success.main',
                              '&:hover': { bgcolor: 'success.dark' }
                            }}
                            data-testid="accept-request-button"
                          >
                            Accept
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            fullWidth
                            onClick={() => handleRejectRequest(request.id)}
                            sx={{ 
                              bgcolor: 'error.main',
                              '&:hover': { bgcolor: 'error.dark' }
                            }}
                          >
                            Reject
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <List>
          {requests.map((request) => (
            <ListItem key={request.id}>
              <ListItemText
                primary={request.fromUsername}
                secondary={request.fromEmail}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  color="primary"
                  onClick={() => handleAcceptRequest(request)}
                  sx={{ mr: 1 }}
                  data-testid="accept-request-button"
                >
                  <CheckIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  color="error"
                  onClick={() => handleRejectRequest(request.id)}
                >
                  <CloseIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {requests.length === 0 && (
            <Typography color="text.secondary">
              No pending partner requests.
            </Typography>
          )}
        </List>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add Accountability Partner</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Partner's Email"
            type="email"
            fullWidth
            value={partnerEmail}
            onChange={(e) => setPartnerEmail(e.target.value)}
            data-testid="partner-email-input"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddPartner} variant="contained" data-testid="send-request-button">
            Send Request
          </Button>
        </DialogActions>
      </Dialog>

      <DeletePartnerDialog
        open={deleteDialog.open}
        partner={deleteDialog.partner}
        onClose={() => setDeleteDialog({ open: false, partner: null })}
        onConfirm={confirmDeletePartner}
      />
    </Box>
  );
};
