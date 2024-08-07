export interface ChecklistItem {
    order: number;
    text: string;
    checked: boolean;
}
export interface ImageAttachment {
    name: string;
    url: string;
    size: number;
}
export interface Note {
    id?: string;
    title: string;
    content: string;
    isChecklist: boolean;
    checklistItems: ChecklistItem[];
    color: string;
    isPinned: boolean;
    createdAt: Date;
    attachments: ImageAttachment[];  // Ändere dies von string[] zu ImageAttachment[]
}