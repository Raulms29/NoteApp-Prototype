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

    /**
     * Creates a new Workspace instance.
     * @param name - The name of the workspace.
     * @param path - The file system path to the workspace.
     * @param id - The unique identifier for the workspace, defaults to a random 8-character string.
     * @param lastAccessed - The date when the workspace was last accessed, defaults to null.
     */
    constructor(name: string, path: string, id = Math.random().toString(36).substring(2, 10), lastAccessed: Date | null = null) {
        this.name = name;
        this.path = path;
        this.id = id;
        this.lastAccessed = lastAccessed;
    }

    /**
     * Gets the path to the notes structure folder within the workspace.
     * @returns The path to the '.notes' folder.
     */
    async notesStructurePath(): Promise<string> {
        return await fileUtils.joinPaths(this.path, '.notes');
    }

    /**
     * Gets the path to the notes structure file within the workspace.
     * @returns The path to the 'notes.json' file inside the '.notes' folder.
     */
    async notesStructureFilePath(): Promise<string> {
        const notesPath = await this.notesStructurePath();
        return await fileUtils.joinPaths(notesPath, 'notes.json');
    }

    /**
     * Gets the path to the files folder within the workspace.
     * @returns The path to the '.files' folder.
     */
    async filesFolderPath(): Promise<string> {
        return await fileUtils.joinPaths(this.path, this.filesFolder);
    }

    /**
     * Gets the name of the files folder.
     * @returns The string '.files'.
     */
    get filesFolder(): string {
        return '.files';
    }

    /**
     * Sets the ID of the workspace.
     * @param id - The unique identifier for the workspace, must be exactly 8 characters long.
     * @throws Will throw an error if the ID is not exactly 8 characters long.
     */
    set id(id: string) {
        id = id.trim();
        if (id.length !== 8) {
            throw new Error('Workspace ID must be exactly 8 characters long');
        }
        this._id = id;
    }

    /**
     * Gets the ID of the workspace.
     * @returns The unique identifier of the workspace.
     */
    get id(): string {
        return this._id;
    }

    /**
     * Gets the name of the workspace.
     * @returns The name of the workspace.
     */
    get name(): string {
        return this._name;
    }

    /**
     * Sets the name of the workspace.
     * @param newName - The new name for the workspace.
     * @throws Will throw an error if the name is empty or exceeds 25 characters.
     */
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
    /**
     * Sets the last accessed date of the workspace.
     * @param date - The date when the workspace was last accessed.
     */
    set lastAccessed(date: Date) {
        this._lastAccessed = date;
    }

    /**
     * Gets the last accessed date of the workspace.
     * @returns The last accessed date of the workspace.
     */
    get lastAccessed(): Date {
        if (this._lastAccessed !== null) {
            return new Date(this._lastAccessed);
        }
        return this._lastAccessed;
    }
}