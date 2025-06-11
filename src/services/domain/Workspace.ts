export interface WorkspaceI {
    name: string;
    path: string;
    id: string;

}

export class Workspace implements WorkspaceI {
    name: string;
    path: string;
    _id: string;


    constructor(name: string, path: string, id = Math.random().toString(36).substring(2, 10)) {
        this.name = name;
        this.path = path;
        this.id = id;
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
}