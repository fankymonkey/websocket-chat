interface Client {
    id: string;
    name: string;
}
export declare class ChatService {
    private clients;
    onClientConnected(client: Client): void;
    onClientDisconnected(id: string): void;
    getClients(): Client[];
}
export {};
