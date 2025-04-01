import crypto from "crypto";
import axios, { type AxiosError, type AxiosResponse } from "axios";
import DigiflazzConfig from "./DigiflazzConfig";

export type PriceListType = "prepaid" | "pasca";

export type TransactionType =
    | null
    | "inquiry-pasca"
    | "payment-pasca"
    | "status-pasca"
    | "pln-subscribe";

export interface DigiflazzInterface {
    createPayload: (command: string) => object;
    checkBalance: () => Promise<CheckBalanceReturnProps>;
    priceList: (
        commandOption: PriceListType,
    ) => Promise<PriceListPrePaidReturnProps | PriceListPostPaidReturnProps>;
    deposit: (properties: DigiflazzDepositProps) => Promise<DepositReturnProps>;
    transaction: (properties: DigiflazzTransactionProps) => Promise<TransactionReturnProps>;
}

export interface DigiflazzDepositProps {
    amount: number;
    bank: string;
    name: string;
}

export interface DigiflazzTransactionProps {
    sku: string;
    customerNumber: string;
    referenceId: string;
    command?: TransactionType;
    testing: boolean;
    message: string;
    maximumPrice?: number;
    callbackUrl?: string;
    allowDot?: boolean;
}

export interface CheckBalanceReturnProps extends AxiosResponse {
    data: {
        deposit: number;
    };
}

export interface PriceListPrePaidReturnProps extends AxiosResponse {
    data: {
        productName: string;
        category: string;
        brand: string;
        type: string;
        sellerName: string;
        price: number;
        buyerSkuCode: string;
        buyerProductStatus: boolean;
        sellerProductStatus: boolean;
        unlimitedStock: boolean;
        stock: number;
        multi: boolean;
        startCutOff: string;
        endCutOff: string;
        description: string;
    }[];
}

export interface PriceListPostPaidReturnProps extends AxiosResponse {
    data: {
        productName: string;
        category: string;
        brand: string;
        sellerName: string;
        admin: number;
        commission: number;
        buyerSkuCode: string;
        buyerProductStatus: boolean;
        sellerProductStatus: boolean;
        description: string;
    }[];
}

export interface DepositReturnProps extends AxiosResponse {
    data: {
        returnCode: string;
        amount: number;
        notes: string;
    };
}

export interface TransactionReturnProps extends AxiosResponse {
    data: {
        referenceId: string;
        customerNumber: string;
        buyerSkuCode: string;
        message: string;
        status: string;
        returnCode: string;
        serialNumber: string;
        buyerLastBalance: number;
        price: number;
        telegram: string;
        whatsapp: string;
    };
}


type DigiflazzParams = {
    config: DigiflazzConfig;
};

export default class Digiflazz implements DigiflazzInterface {
    private config: DigiflazzConfig;
    public endpoint: string;

    public constructor({ config }: DigiflazzParams) {
        this.config = config;
        this.endpoint = "https://api.digiflazz.com/v1";
    }

    public createSigner(text: string): string {
        return crypto
            .createHash("md5")
            .update(text)
            .digest("hex")
    }


    public createPayload(command: string) {
        const { username, key } = this.config;

        return {
            command,
            username,
            sign: this.createSigner(`${username}${key}${command}`),
        };
    }

    public async checkBalance(): Promise<CheckBalanceReturnProps> {
        const payload = this.createPayload("depo");

        try {
            const { data } = await axios.post<CheckBalanceReturnProps>(
                `${this.endpoint}/check-balance`,
                payload,
            );
            return data;
        } catch (error) {
            const axiosError = error as AxiosError<unknown>;

            throw new Error(`Request failed with status ${axiosError.response?.status}: ${axiosError.message}`);
        }
    }

    public async priceList(
        commandOption: PriceListType,
    ): Promise<PriceListPrePaidReturnProps | PriceListPostPaidReturnProps> {
        const payload = this.createPayload(commandOption);

        try {
            const { data } = await axios.post<
                PriceListPrePaidReturnProps | PriceListPostPaidReturnProps
            >(`${this.endpoint}/price-list`, payload);

            return data;
        } catch (error) {
            const axiosError = error as AxiosError<unknown>;

            throw new Error(`Request failed with status ${axiosError.response?.status}: ${axiosError.message}`);
        }
    };

    public async deposit(
        properties: DigiflazzDepositProps,
    ): Promise<DepositReturnProps> {
        const { username, key } = this.config;
        const payload = {
            ...properties,
            bank: properties.bank,
            ownerName: properties.name,
            sign: this.createSigner(`${username}${key}deposit`),
        };

        try {
            const { data } = await axios.post<DepositReturnProps>(
                `${this.endpoint}/deposit`,
                payload,
            );
            return data;
        } catch (error) {
            const axiosError = error as AxiosError<unknown>;
            throw new Error(`Request failed: ${axiosError.message}`);
        }
    };

    public async transaction(
        properties: DigiflazzTransactionProps,
    ): Promise<TransactionReturnProps> {
        const { username, key } = this.config;
        const {
            sku,
            customerNumber,
            referenceId,
            command = null,
            maximumPrice,
            callbackUrl,
            allowDot,
            ...additionalProps
        } = properties;

        const payload = {
            ...additionalProps,
            buyerSkuCode: sku,
            customerNumber,
            referenceId,
            ...(command && { command }),
            ...(maximumPrice && { maximumPrice }),
            ...(callbackUrl && { callbackUrl }),
            ...(allowDot && { allowDot }),
            sign: this.createSigner(`${username}${key}${referenceId}`),
        };

        if (command) {
            const validCommands = ["inquiry-pasca", "payment-pasca", "status-pasca", "pln-subscribe"];
            if (validCommands.includes(command)) {
                payload.command = command;
            }
        }

        try {
            const { data } = await axios.post<TransactionReturnProps>(
                `${this.endpoint}/transaction`,
                payload,
            );
            return data;
        } catch (error) {
            const axiosError = error as AxiosError<unknown>;
            throw new Error(`Request failed: ${axiosError.message}`);
        }
    }
}