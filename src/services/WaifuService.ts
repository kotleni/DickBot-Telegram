import axios from "axios";

interface WaifuService {
    getPicture(type: string, category: string): Promise<string | null>;
}

class WaifuServiceImpl implements WaifuService {
    private readonly baseUrl = "https://api.waifu.pics";

    async getPicture(type: string, category: string): Promise<string | null> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/${type}/${category}`,
            );
            return response.data?.url ?? null;
        } catch (error) {
            console.error(
                `Waifu.pics API error for ${type}/${category}:`,
                (error as Error).message,
            );
            return null;
        }
    }
}

function createWaifuService(): WaifuService {
    return new WaifuServiceImpl();
}

export { WaifuService, createWaifuService };
