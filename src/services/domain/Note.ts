const invalidCharacters = /[\\/:*?"<>|]/; // Regex for invalid note name characters
export interface RawNote {
    _name: string;
    _id: string;
    _createdAt: string; // Dates are typically stored as strings in JSON
    _children?: RawNote[]; // Optional array of child notes
    _lastAccessed: string;
}

export class Note {

    private _id: string;
    private _name: string;
    private _children: Note[];
    private readonly _createdAt: Date;
    private _lastAccessed: Date;

    /**
     * Creates a new Note instance.
     * @param id - The unique identifier for the note, must be exactly 8 characters long.
     * @param name - The name of the note, must not contain invalid filename characters.
     * @param children - An optional array of child notes.
     * @param createdAt - The creation date of the note, defaults to the current date.
     * @param lastAccessed - The date when the note was last accessed, defaults to null.
     * @throws Will throw an error if there is a validation error.
     */
    constructor(name: string, children: Note[] = [], id: string = Math.random().toString(36).substring(2, 10), createdAt: Date = new Date(), lastAccessed: Date | null = null) {
        this.id = id;
        this.name = name;
        this._children = children;
        this._createdAt = createdAt;
        this.lastAccessed = lastAccessed;
    }

    /**
     * Sets the ID of the note.
     * @param id - The unique identifier for the note, must be exactly 8 characters long.
     * @throws Will throw an error if the ID is empty, contains invalid characters, or is not exactly 8 characters long.
     */
    private set id(id: string) {
        id = id.trim();
        if (invalidCharacters.test(id)) {
            throw new Error('Note ID cannot contain any of these characters: \\ / : * ? " < > |');
        }
        if (id.length !== 8) {
            throw new Error('Note ID must be exactly 8 characters long');
        }
        this._id = id;
    }

    /**
     * Gets the ID of the note.
     * @returns The unique identifier of the note.
     */
    get id(): string {
        return this._id;
    }

    /**
     * Gets the name of the note.
     * @returns The name of the note.
     */
    get name(): string {
        return this._name;
    }

    /**
     * Sets the name of the note.
     * @param newName - The new name for the note
     * @throws Will throw an error if the name is empty, exceeds 30 characters, or contains invalid characters.
     */
    set name(newName: string) {
        newName = newName.trim();

        if (invalidCharacters.test(newName)) {
            throw new Error('Note name cannot contain any of these characters: \\ / : * ? " < > |');
        }

        if (newName.length === 0) {
            throw new Error('Note name cannot be empty.');
        }

        if (newName.length > 30) {
            throw new Error('Note name cannot exceed 30 characters.');
        }

        this._name = newName;
    }

    /**
     * Gets the children of the note.
     * @returns An array of child notes.
     */
    get children(): Note[] {
        return this._children;
    }

    /**
     * Gets the creation date of the note.
     * @returns The creation date of the note.
     */
    get createdAt(): Date {
        return this._createdAt;
    }

    /**
     * Gets the last accessed date of the note.
     * @returns The last accessed date of the note.
     */
    get lastAccessed(): Date {
        return this._lastAccessed;
    }

    /**
     * Sets the last accessed date of the note.
     * @param date - The date when the note was last accessed.
     */
    set lastAccessed(date: Date) {
        this._lastAccessed = date;
    }

    /**
     * Adds a child note to the current note.
     * @param child - The child note to add.
     * @throws Will throw an error if the child already exists or if the child is the same as the parent.
     */
    addChild(child: Note): void {
        if (this.children.some(existingChild => existingChild.id === child.id)) {
            throw new Error(`Child with ID ${child.id} already exists in this note.`);
        }
        if (child.id === this.id) {
            throw new Error(`Cannot add a note as a child of itself.`);
        }
        this._children.push(child);
    }

    /**
     * Checks if the note has a descendant with the specified ID.
     * @param noteID - The ID of the descendant to check for.
     * @returns True if the descendant exists, false otherwise.
     */
    hasDescendantByID(noteID: string): boolean {
        if (this.hasChildByID(noteID))
            return true;

        for (const child of this._children) {
            if (child.hasDescendantByID(noteID)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Checks if the note has the specified child.
     * @param note - The child note to check for.
     * @returns True if the child exists, false otherwise.
     */
    hasChild(note: Note): boolean {
        return this.hasChildByID(note._id);
    }

    /**
     * Checks if the note has a child with the specified ID.
     * @param noteID - The ID of the child to check for.
     * @returns True if the child exists, false otherwise.
     */
    hasChildByID(noteID: string): boolean {
        return this._children.some(child => child._id === noteID);
    }

    /**
     * Checks if the note has the specified descendant.
     * @param note - The descendant note to check for.
     * @returns True if the descendant exists, false otherwise.
     */
    hasDescendant(note: Note): boolean {
        return this.hasDescendantByID(note.id);
    }

    /**
     * Removes a child note from the current note.
     * @param note - The child note to remove.
     * @returns True if the child was removed, false otherwise.
     */
    removeChild(note: Note): boolean {
        const numberOfChildren = this._children.length;
        this._children = this._children.filter(child => child._id !== note._id);
        return this._children.length < numberOfChildren;
    }

    /**
     * Removes a descendant note from the current note.
     * @param note - The descendant note to remove.
     * @returns True if the descendant was removed, false otherwise.
     */
    removeDescendant(note: Note): boolean {
        if (!(this.removeChild(note))) {
            for (const child of this._children) {
                if (child.hasDescendant(note)) {
                    child.removeDescendant(note);
                    return true; // Note was found and removed
                }
            }
            return false; // Note was not found in any child
        }
        return true; // Note was found and removed directly
    }

    /**
     * Retrieves all descendant notes of the current note (children, grandchildren, etc.).
     * @returns An array containing all descendant notes.
     */
    getDescendants(): Note[] {
        const descendants: Note[] = [];
        for (const child of this._children) {
            descendants.push(...[child, ...child.getDescendants()]);
        }
        return descendants;
    }

    /**
     * Checks if the note has any child notes.
     * @returns True if the note has one or more children, false otherwise.
     */
    hasChildren(): boolean {
        return this._children.length > 0;
    }
}