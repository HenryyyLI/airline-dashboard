import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const makeRequest = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

const useFetch = (url, method = 'GET', body = null) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!url) {
            setData(null);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                
                const res = await (method === 'GET' 
                    ? makeRequest.get(url) 
                    : makeRequest.post(url, body));

                setData(res.data.data);
            } catch (err) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url, body]);

    return { data, loading }
}

export default useFetch