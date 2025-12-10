import { Card, CardContent } from "@/components/ui/card";
import React, { useEffect, useRef, useMemo } from "react";
import { init } from "echarts";
import useFetch from '../../hooks/useFetch';
import useContext from '../../zustand/useContext';
import { Spinner } from "@/components/ui/spinner";

export default function SubItemScoringSection() {
    const chartRef = useRef(null);
    const targetAirline = useContext((state) => state.targetAirline);
    
    const url = useMemo(() => {
        if (!targetAirline) return null;
        return `/airlines/${encodeURIComponent(targetAirline)}/sub-item-scoring`;
    }, [targetAirline]);
    
    const { data, loading } = useFetch(url);

    useEffect(() => {
        if (!chartRef.current || !data) return;

        const chart = init(chartRef.current);

        const categories = [
            'Seat Comfort',
            'Cabin Staff & Service',
            'Food & Beverages',
            'Inflight Entertainment',
            'Ground Service',
            'Wifi Connectivity',
            'Value for Money'
        ];

        const targetData = categories.map(cat => data.target_airline[cat]);
        const avgData = categories.map(cat => data.average_score[cat]);

        const option = {
            grid: {
                top: '10%',
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: ['Target Airline', 'Average Score'],
                bottom: '0%',
                textStyle: {
                    fontSize: 12
                },
                itemWidth: 10,
                itemHeight: 10,
                icon: 'circle'
            },
            xAxis: {
                type: 'category',
                data: [
                    'Seat\nComfort',
                    'Cabin Staff\n& Service',
                    'Food &\nBeverages',
                    'Inflight\nEntertainment',
                    'Ground\nService',
                    'Wifi\nConnectivity',
                    'Value for\nMoney'
                ],
                axisLine: {
                    lineStyle: {
                        color: '#e0e0e0'
                    }
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    color: '#999',
                    fontSize: 11,
                    interval: 0
                }
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: 5,
                interval: 1,
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    color: '#999'
                },
                splitLine: {
                    lineStyle: {
                        color: '#f0f0f0',
                        type: 'dashed'
                    }
                }
            },
            series: [
                {
                    name: 'Target Airline',
                    type: 'bar',
                    data: targetData,
                    itemStyle: {
                        color: '#0095ff',
                        borderRadius: [4, 4, 0, 0]
                    },
                    barWidth: '35%'
                },
                {
                    name: 'Average Score',
                    type: 'bar',
                    data: avgData,
                    itemStyle: {
                        color: '#00e096',
                        borderRadius: [4, 4, 0, 0]
                    },
                    barWidth: '35%'
                }
            ]
        };

        chart.setOption(option);

        const resizeObserver = new ResizeObserver(() => {
            chart.resize();
        });

        if (chartRef.current) {
            resizeObserver.observe(chartRef.current);
        }

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
                        ✈️ Please search for an airline to view sub-item scoring
                    </div>
                </div>
            ) : loading ? (
                <div className="flex items-center justify-center h-full">
                    <Spinner className="w-10 h-10 text-[#5D5FEF]" />
                </div>
            ) : !data ? (
                <div className="flex items-center justify-center h-full">
                    <div className="text-xl font-semibold text-center">
                        😢 No sub-item scoring data available
                    </div>
                </div>
            ) : (
                <>
                    <div className="pl-6 text-xl font-semibold">Sub-Item Scoring</div>

                    <CardContent className="flex flex-1 min-h-[250px]">
                        <div ref={chartRef} className="w-full h-full" />
                    </CardContent>
                </>
            )}
        </Card>
    );
}
