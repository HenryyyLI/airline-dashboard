import { Card, CardContent } from "@/components/ui/card";
import React, { useEffect, useRef } from "react";
import { init } from "echarts";
import "echarts-wordcloud";

export default function ReviewWordcloudSection() {
    const posChartRef = useRef(null);
    const negChartRef = useRef(null);

    const positiveWords = [
        { name: "comfortable", value: 85 },
        { name: "excellent", value: 78 },
        { name: "friendly", value: 72 },
        { name: "clean", value: 68 },
        { name: "spacious", value: 65 },
        { name: "professional", value: 62 },
        { name: "smooth", value: 58 },
        { name: "helpful", value: 55 },
        { name: "pleasant", value: 52 },
        { name: "efficient", value: 48 },
        { name: "great", value: 45 },
        { name: "nice", value: 42 },
        { name: "good", value: 40 },
        { name: "amazing", value: 38 },
        { name: "wonderful", value: 35 }
    ];

    const negativeWords = [
        { name: "delayed", value: 92 },
        { name: "uncomfortable", value: 88 },
        { name: "poor", value: 82 },
        { name: "rude", value: 76 },
        { name: "dirty", value: 70 },
        { name: "cramped", value: 65 },
        { name: "terrible", value: 60 },
        { name: "disappointing", value: 58 },
        { name: "awful", value: 55 },
        { name: "bad", value: 52 },
        { name: "unpleasant", value: 48 },
        { name: "slow", value: 45 },
        { name: "unprofessional", value: 42 },
        { name: "crowded", value: 40 },
        { name: "broken", value: 38 }
    ];

    useEffect(() => {
        if (posChartRef.current) {
            const posChart = init(posChartRef.current);
            posChart.setOption({
                tooltip: {
                    show: true,
                    formatter: (params) => `${params.name}<br/>Count: ${params.value}`,
                },
                series: [{
                    type: 'wordCloud',
                    shape: 'circle',
                    left: 0,
                    right: 0,
                    width: '100%',
                    height: '100%',
                    sizeRange: [14, 50],
                    rotationRange: [-45, 45],
                    gridSize: 8,
                    textStyle: {
                        fontFamily: 'sans-serif',
                        fontWeight: 'bold',
                        color: () => {
                            const greenShades = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#22c55e', '#16a34a'];
                            return greenShades[Math.floor(Math.random() * greenShades.length)];
                        }
                    },
                    data: positiveWords
                }]
            });

            const posObserver = new ResizeObserver(() => {
                posChart.resize();
            });
            posObserver.observe(posChartRef.current);
            posChartRef.current._observer = posObserver;
        }

        if (negChartRef.current) {
            const negChart = init(negChartRef.current);
            negChart.setOption({
                tooltip: {
                    show: true,
                    formatter: (params) => `${params.name}<br/>Count: ${params.value}`,
                },
                series: [{
                    type: 'wordCloud',
                    shape: 'circle',
                    left: 0,
                    right: 0,
                    width: '100%',
                    height: '80%',
                    sizeRange: [14, 50],
                    rotationRange: [-45, 45],
                    gridSize: 8,
                    textStyle: {
                        fontFamily: 'sans-serif',
                        fontWeight: 'bold',
                        color: () => {
                            const redShades = ['#ef4444', '#dc2626', '#f87171', '#fca5a5', '#e11d48', '#be123c'];
                            return redShades[Math.floor(Math.random() * redShades.length)];
                        }
                    },
                    data: negativeWords
                }]
            });

            const negObserver = new ResizeObserver(() => {
                negChart.resize();
            });
            negObserver.observe(negChartRef.current);
            negChartRef.current._observer = negObserver;
        }

        return () => {
            if (posChartRef.current) {
                posChartRef.current._observer?.disconnect();
                dispose(posChartRef.current);
            }
            if (negChartRef.current) {
                negChartRef.current._observer?.disconnect();
                dispose(negChartRef.current);
            }
        };
    }, []);

    return (
        <Card className="bg-white rounded-[20px] border border-[#f8f9fa] shadow-[0px_4px_20px_#ededed80]">
            <div className="pl-6 text-xl font-semibold">Review WorldCloud</div>

            <CardContent className="flex flex-1 justify-between gap-4 mx-2">
                <div className="flex flex-1 flex-col">
                    <div ref={posChartRef} className="w-full h-full" />
                    <div className="flex items-center justify-center gap-2 mt-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
                        <span className="text-xs font-normal">Positive Sentiment</span>
                    </div>
                </div>

                <div className="flex flex-1 flex-col">
                    <div ref={negChartRef} className="w-full h-full" />
                    <div className="flex items-center justify-center gap-2 mt-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                        <span className="text-xs font-normal">Negative Sentiment</span>
                    </div>
                </div>

                <div className="flex flex-col gap-4 justify-center">
                    <div className="flex justify-between gap-4">
                        <div>
                            <div className="text-base font-medium text-gray-500">Positive Score</div>
                            <div className="text-sm font-medium text-gray-500">Word Count</div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-semibold text-green-600">8,823</div>
                            <div className="text-sm font-medium text-gray-500">232</div>
                        </div>
                    </div>

                    <div className="flex justify-between gap-4">
                        <div>
                            <div className="text-base font-medium text-gray-500">Negative Score</div>
                            <div className="text-sm font-medium text-gray-500">Word Count</div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-semibold text-red-600">-5,765</div>
                            <div className="text-sm font-medium text-gray-500">362</div>
                        </div>
                    </div>

                    <div className="flex justify-between gap-4">
                        <div>
                            <div className="text-base font-medium text-gray-500">Overall Score</div>
                            <div className="text-sm font-medium text-gray-500">Word Count</div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-semibold text-green-600">3,463</div>
                            <div className="text-sm font-medium text-gray-500">594</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
