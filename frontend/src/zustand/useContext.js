import { create } from 'zustand';

const useContext = create((set) => ({
    targetAirline: null,
    setTargetAirline: (text) => set({ targetAirline: text }),

}));

export default useContext;