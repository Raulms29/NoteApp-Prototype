export interface WorkspaceI {
    id: string;
    name: string;
    path: string;
}

export class Workspace implements WorkspaceI {
    id: string;
    name: string;
    path: string;

    constructor({ id, name, path }: WorkspaceI) {
        this.id = id;
        this.name = name;
        this.path = path;
    }
}
