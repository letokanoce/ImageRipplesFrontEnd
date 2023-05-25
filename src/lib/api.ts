import axios from 'axios';
const BASE_URL = 'http://0.0.0.0:6002';

export const searchImages = async (query: string[]) => {
    try {
        const params = query.map((q) => `keywords=${encodeURIComponent(q)}`);
        const url = `${BASE_URL}/search?${params.join('&')}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(error);
    }
};

export const findSimilarImages = async (query: string) => {
    try {
        const url = `${BASE_URL}/find/similar?img_id=${query}`;
        const response = await axios.get(url);
        console.log("data received from the API", response.data);
        return response.data;
    } catch (error) {
        console.error(error);
    }
};

export const handleInterference = async (param1: string, param2: string) => {
    try {
        const url = `${BASE_URL}/interference/collapse`;
        const data = {
            img_id_1: param1,
            img_id_2: param2
        };
        const response = await axios.post(url, data);
        console.log("Data received from the API:", response.data);
        return response.data;
    } catch (error) {
        console.error(error);
    }
};
