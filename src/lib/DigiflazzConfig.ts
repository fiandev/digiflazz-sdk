export interface DigiflazzConfigParams {
    username: string;
    key: string;
    webhook?: string;
}



export default class DigiflazzConfig {
    public username: string;
    public key: string;
    public webhook?: string;

    public constructor({ username, key, webhook }: DigiflazzConfigParams) {
        this.username = username;
        this.key = key;
        this.webhook = webhook;
    }
}