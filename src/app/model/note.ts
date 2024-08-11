export interface ChecklistItem {
    id: string;
    order: number;
    text: string;
    checked: boolean;
}

export interface ImageAttachment {
    id: string;
    name: string;
    url: string;
    size: number;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    isChecklist: boolean;
    checklistItems: ChecklistItem[];
    color: string;
    isPinned: boolean;
    createdAt: Date;
    editAt: Date | null;  // Erlaubt null oder einen leeren String
    delete: boolean;
    attachments: ImageAttachment[];
}