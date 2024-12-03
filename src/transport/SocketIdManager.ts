

class SocketIdsManager {
    private active_connections : Record<string , unknown> = {}

    private static instance: SocketIdsManager;

    private constructor() {}

    public static getInstance() : SocketIdsManager {
        if(!SocketIdsManager.instance){
            SocketIdsManager.instance = new SocketIdsManager()
        }
        return SocketIdsManager.instance;
    }

    public addSocketId(socketId:string) : string {
        this.active_connections[socketId] = socketId;
        return socketId;
    }

    public removeSocketId(socketId : string) : string {
        delete this.active_connections[socketId]
        return socketId;
    }

    public getConnectionBySocketId(socketId : string) : any {
        return this.active_connections[socketId]
    }

}

export {  SocketIdsManager}