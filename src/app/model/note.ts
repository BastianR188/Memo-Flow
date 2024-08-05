interface Note {
    id: string;
    type: 'note' | 'checklist';
    content: string | ChecklistItem[];
    color: string;
    labels: string[];
    isPinned: boolean;
    attachments: Attachment[];
    createdAt: Date;
    updatedAt: Date;
}