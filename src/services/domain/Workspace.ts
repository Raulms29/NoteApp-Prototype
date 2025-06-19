import * as fileUtils from '../../utils/fileUtils';

export interface WorkspaceI {
    name: string;
    path: string;
    id: string;
}

export class Workspace implements WorkspaceI {
    _name: string;
    path: string;
    _id: string;


    constructor(name: string, path: string, id = Math.random().toString(36).substring(2, 10)) {
        this.name = name;
        this.path = path;
        this.id = id;
    }

    async notesStructurePath(): Promise<string> {
        return await fileUtils.joinPaths(this.path, '.notes');
    }

    async notesStructureFilePath(): Promise<string> {
        const notesPath = await this.notesStructurePath();
        return await fileUtils.joinPaths(notesPath, 'notes.json');
    }

    async filesPath(): Promise<string> {
        return await fileUtils.joinPaths(this.path, '.files');
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
}