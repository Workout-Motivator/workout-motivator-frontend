export interface ChatMessage {
    id: string;
    text: string;
    createdAt: any;
    uid: string;
    displayName: string;
    partnerId: string;
    read: boolean;
}

export interface Partner {
    id: string;
    email: string;
    username: string;
    status: 'pending' | 'accepted';
}
