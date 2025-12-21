import { Card, CardContent } from "@/components/ui/card";
import React, { useEffect, useRef, useMemo } from "react";
import useFetch from '../../hooks/useFetch';
import useContext from '../../zustand/useContext';
import { Spinner } from "@/components/ui/spinner";

export default function FeatureImportanceSection() {
    const targetAirline = useContext((state) => state.targetAirline);

    const url = useMemo(() => {
        if (!targetAirline) return null;
        return `/airlines/${encodeURIComponent(targetAirline)}/feature-importance`;
    }, [targetAirline]);

    const { data, loading } = useFetch(url);

    const featureConfig = {
        seatComfort: { label: "Seat Comfort", color: "#0095ff" },
        cabinStaffService: { label: "Cabin Staff & Service", color: "#00e096" },
        foodBeverages: { label: "Food & Beverages", color: "#8950fc" },
        inflightEntertainment: { label: "Inflight Entertainment", color: "#f64e60" },
        groundService: { label: "Ground Service", color: "#ffa800" },
        wifiConnectivity: { label: "Wifi Connectivity", color: "#00ab9a" },
        valueForMoney: { label: "Value for Money", color: "#6d155d" }
    };

    const leftColumn = ['seatComfort', 'foodBeverages', 'groundService'];
    const rightColumn = ['cabinStaffService', 'inflightEntertainment', 'wifiConnectivity'];

    return (
        <Card className="bg-white rounded-[20px] border border-[#f8f9fa] shadow-[0px_4px_20px_#ededed80]">
            {!targetAirline ? (
                <div className="flex items-center justify-center h-full">
                    <div className="text-xl font-semibold text-center">
                        ✈️ Please search for an airline to view feature importance
                    </div>
                </div>
            ) : loading ? (
                <div className="flex items-center justify-center h-full">
                    <Spinner className="w-10 h-10 text-[#5D5FEF]" />
                </div>
            ) : !data ? (
                <div className="flex items-center justify-center h-full">
                    <div className="text-xl font-semibold text-center">
                        😢 No feature importance data available
                    </div>
                </div>
            ) : (
                <>
                    <div className="pl-6 text-xl font-semibold">Feature Importance</div>

                    <CardContent className="flex flex-1 min-h-[300px] justify-center items-center">
                        <div className="flex flex-col gap-6">
                            <div className="flex gap-4">
                                <div className="flex flex-col gap-6">
                                    {leftColumn.map(key => (
                                        <div key={key} className="flex flex-col items-center gap-2">
                                            <div className="flex items-center gap-2">
                                                <span 
                                                    className="w-2.5 h-2.5 rounded-full" 
                                                    style={{ backgroundColor: featureConfig[key].color }}
                                                />
                                                <span className="text-xs text-gray-500">{featureConfig[key].label}</span>
                                            </div>
                                            <span className="text-base font-semibold">
                                                {data[key]?.toFixed(3) || '0.000'}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-6">
                                    {rightColumn.map(key => (
                                        <div key={key} className="flex flex-col items-center gap-2">
                                            <div className="flex items-center gap-2">
                                                <span 
                                                    className="w-2.5 h-2.5 rounded-full" 
                                                    style={{ backgroundColor: featureConfig[key].color }}
                                                />
                                                <span className="text-xs text-gray-500">{featureConfig[key].label}</span>
                                            </div>
                                            <span className="text-base font-semibold">
                                                {data[key]?.toFixed(3) || '0.000'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <span 
                                        className="w-2.5 h-2.5 rounded-full" 
                                        style={{ backgroundColor: featureConfig.valueForMoney.color }}
                                    />
                                    <span className="text-xs text-gray-500">{featureConfig.valueForMoney.label}</span>
                                </div>
                                <span className="text-base font-semibold">
                                    {data.valueForMoney?.toFixed(3) || '0.000'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </>
            )}
        </Card>
    );
}
