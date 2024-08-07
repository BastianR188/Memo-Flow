export interface ChecklistItem {
    order: number;
    text: string;
    checked: boolean;
}

export class Note {
    id: string;
    title: string;
    content: string;
    isChecklist: boolean;
    checklistItems: ChecklistItem[];
    color: string;
    isPinned: boolean;
    attachments: string[]; // Wir speichern nur die Dateinamen
    createdAt: Date;

    constructor(data: Partial<Note> = {}) {
        this.id = data.id || '';
        this.title = data.title || '';
        this.content = data.content || '';
        this.isChecklist = data.isChecklist || false;
        this.checklistItems = data.checklistItems || [];
        this.color = data.color || '';
        this.isPinned = data.isPinned || false;
        this.attachments = data.attachments || [];
        this.createdAt = data.createdAt || new Date();
    }
}