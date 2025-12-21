import { create } from 'zustand';

const useContext = create((set) => ({
    targetAirline: null,
    setTargetAirline: (text) => set({ targetAirline: text }),

    sentimentData: null,
    setSentimentData: (text) => set({ sentimentData: text }),
}));

export default useContext;