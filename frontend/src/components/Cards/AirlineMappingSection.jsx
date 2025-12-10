import { Card, CardContent } from "@/components/ui/card";
import React, { useEffect, useRef, useMemo } from "react";
import { init, registerMap } from "echarts";
import useFetch from '../../hooks/useFetch';
import useContext from '../../zustand/useContext';
import { Spinner } from "@/components/ui/spinner";

export const AirlineMappingSection = () => {
    const chartRef = useRef(null);
    const targetAirline = useContext((state) => state.targetAirline);
    
    const url = useMemo(() => {
        if (!targetAirline) return null;
        return `/airlines/${encodeURIComponent(targetAirline)}/city-distribution`;
    }, [targetAirline]);

    const { data, loading } = useFetch(url);

    useEffect(() => {
        if (!chartRef.current || !data) return;

        const chart = init(chartRef.current);
        chart.showLoading();

        fetch('/world.json')
            .then(response => response.json())
            .then(geoJSON => {
                registerMap('world', geoJSON);

                const option = {
                    tooltip: {
                        trigger: 'item',
                        formatter: (params) => {
                            if (params.componentSubType === 'scatter') {
                                return `${params.name}<br/>Routes: ${params.value[2]}`;
                            }
                            return params.name;
                        }
                    },
                    geo: {
                        map: 'world',
                        left: 0,
                        right: 0,
                        width: '100%',
                        height: '100%',
                        roam: false,
                        zoom: 1,
                        center: [10, 15],
                        itemStyle: {
                            areaColor: '#e5e7eb',
                            borderColor: '#fff',
                            borderWidth: 1.5
                        },
                        emphasis: {
                            itemStyle: {
                                areaColor: '#d1d5db'
                            }
                        }
                    },
                    series: [
                        {
                            type: 'scatter',
                            coordinateSystem: 'geo',
                            data: data,
                            symbolSize: (val) => {
                                return Math.sqrt(val[2]) * 3.5;
                            },
                            itemStyle: {
                                opacity: 0.8
                            },
                            emphasis: {
                                scale: true,
                                scaleSize: 15
                            }
                        }
                    ]
                };

                chart.setOption(option);
                chart.hideLoading();
            })
            .catch(err => {
                console.error('Failed to load map:', err);
                chart.hideLoading();
            });

        const resizeObserver = new ResizeObserver(() => {
            chart.resize();
        });

        resizeObserver.observe(chartRef.current);

        return () => {
            resizeObserver.disconnect();
            chart.dispose();
            // chartRef.current = null;
        };
    }, [data]);

    return (
        <Card className="bg-white rounded-[20px] border border-[#f8f9fa] shadow-[0px_4px_20px_#ededed80] min-h-[300px]">
            {!targetAirline ? (
                <div className="flex items-center justify-center h-full">
                    <div className="text-xl font-semibold text-center">
                        ✈️ Please search for an airline to view city distribution
                    </div>
                </div>
            ) : loading ? (
                <div className="flex items-center justify-center h-full">
                    <Spinner className="w-10 h-10 text-[#5D5FEF]" />
                </div>
            ) : !data || data.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                    <div className="text-xl font-semibold text-center">
                        😢 No city distribution data available
                    </div>
                </div>
            ) : (
                <>
                    <div className="pl-6 text-xl font-semibold">Airline Mapping</div>

                    <CardContent className="flex flex-1 min-h-[250px]">
                        <div ref={chartRef} className="w-full h-full" />
                    </CardContent>
                </>
            )}
        </Card>
    );
};

export default AirlineMappingSection