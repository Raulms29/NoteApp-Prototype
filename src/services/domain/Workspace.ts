import * as fileUtils from '../../utils/fileUtils';

export interface WorkspaceI {
    name: string;
    path: string;
    id: string;
    lastAccessed: Date;
}

export class Workspace implements WorkspaceI {
    private _name: string;
    path: string;
    private _id: string;
    private _lastAccessed: Date;


    constructor(name: string, path: string, id = Math.random().toString(36).substring(2, 10), lastAccessed: Date | null = null) {
        this.name = name;
        this.path = path;
        this.id = id;
        this.lastAccessed = lastAccessed;
    }

    async notesStructurePath(): Promise<string> {
        return await fileUtils.joinPaths(this.path, '.notes');
    }

    async notesStructureFilePath(): Promise<string> {
        const notesPath = await this.notesStructurePath();
        return await fileUtils.joinPaths(notesPath, 'notes.json');
    }

    async filesFolderPath(): Promise<string> {
        return await fileUtils.joinPaths(this.path, this.filesFolder);
    }

    get filesFolder(): string {
        return '.files';
    }

    set id(id: string) {
        id = id.trim();
        if (id.length !== 8) {
            throw new Error('Workspace ID must be exactly 8 characters long');
        }
        this._id = id;
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    set name(newName: string) {
        newName = newName.trim();
        if (newName.length === 0) {
            throw new Error('Workspace name cannot be empty');
        }
        if (newName.length > 25) {
            throw new Error('Workspace name cannot exceed 25 characters');
        }
        this._name = newName;
    }
    set lastAccessed(date: Date) {
        this._lastAccessed = date;
    }

    get lastAccessed(): Date {
        if (this._lastAccessed !== null) {
            return new Date(this._lastAccessed);
        }
        return this._lastAccessed;
    }
}