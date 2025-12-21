import React, { useState, useEffect, useRef, Fragment } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useContext from "../../zustand/useContext";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { init } from "echarts";
import "echarts-wordcloud";

const SentimentalAnalysisCard = () => {
    const [cardPage, setCardPage] = useState(0);
    const posChartRef = useRef(null);
    const negChartRef = useRef(null);
    const sentimentData = useContext((state) => state.sentimentData);

    const getHighlightedText = (text, posWords, negWords, posDict, negDict) => {
        if (!text) return text;

        const allWords = [...posWords, ...negWords];
        const regex = new RegExp(`(${allWords.join("|")})`, "gi");
        const lines = text.split("\n");

        return lines.map((line, lineIndex) => (
            <Fragment key={lineIndex}>
                {line.split(regex).map((part, index) => {
                    if (posWords.includes(part)) {
                        return (
                            <TooltipProvider key={`${lineIndex}-${index}`}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="bg-green-200 px-1 py-0.5 rounded mx-0.5 font-bold cursor-help">
                                            {part}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-sm">Score: {posDict[part]?.score?.toFixed(3) || 0}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        );
                    }

                    if (negWords.includes(part)) {
                        return (
                            <TooltipProvider key={`${lineIndex}-${index}`}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="bg-red-200 px-1 py-0.5 rounded mx-0.5 font-bold cursor-help">
                                            {part}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-sm">Score: {negDict[part]?.score?.toFixed(3) || 0}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        );
                    }

                    return <span key={`${lineIndex}-${index}`}>{part}</span>;
                })}
                {lineIndex < lines.length - 1 && <br />}
            </Fragment>
        ));
    };

    const renderWordCloud = (chartRef, words, colorShades) => {
        const myChart = init(chartRef.current);
        
        const option = {
            tooltip: {
                show: true,
                formatter: (params) => `${params.name}<br>Score: ${params.value}`,
            },
            series: [{
                type: "wordCloud",
                shape: "circle",
                left: 0,
                right: 0,
                width: '100%',
                height: '100%',
                sizeRange: [14, 50],
                rotationRange: [-45, 45],
                gridSize: 8,
                textStyle: {
                    fontFamily: "sans-serif",
                    fontWeight: "bold",
                    color: () => {
                        return colorShades[Math.floor(Math.random() * colorShades.length)];
                    },
                },
                data: words,
            }],
        };
        
        myChart.setOption(option);
        
        const observer = new ResizeObserver(() => {
            myChart.resize();
        });
        observer.observe(chartRef.current);
        chartRef.current._observer = observer;
    };
    
    useEffect(() => {
        if (sentimentData && cardPage === 1) {
            const timer = setTimeout(() => {
                const posWords = Object.entries(sentimentData.pos_dict || {}).map(([word, metrics]) => ({
                    name: word,
                    value: Math.abs(metrics.score) || 1,
                }));
        
                const negWords = Object.entries(sentimentData.neg_dict || {}).map(([word, metrics]) => ({
                    name: word,
                    value: Math.abs(metrics.score) || 1,
                }));
        
                const greenShades = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#22c55e', '#16a34a'];
                const redShades = ['#ef4444', '#dc2626', '#f87171', '#fca5a5', '#e11d48', '#be123c'];
        
                if (posChartRef.current && negChartRef.current) {
                    renderWordCloud(posChartRef, posWords, greenShades);
                    renderWordCloud(negChartRef, negWords, redShades);
                }
            }, 350);
            
            return () => clearTimeout(timer);
        }
    }, [sentimentData, cardPage]);

    const renderCardContent = () => {
        if (cardPage === 0) {
            return (
                <>
                    <h2 className="text-3xl font-semibold tracking-tight">Analysis Result</h2>
                    <div className="border-1 border-gray-300 w-full my-4"></div>

                    {sentimentData ? (
                        <div className="max-h-[480px] overflow-auto text-base leading-relaxed">
                            {getHighlightedText(
                                sentimentData.text,
                                Object.keys(sentimentData.pos_dict || {}),
                                Object.keys(sentimentData.neg_dict || {}),
                                sentimentData.pos_dict || {},
                                sentimentData.neg_dict || {}
                            )}
                        </div>
                    ) : (
                        <div className="flex h-full justify-center items-center">
                            <h4 className="text-xl font-semibold tracking-tight">
                                😢 Loading or no data available
                            </h4>
                        </div>
                    )}
                </>
            );
        } else {
            return (
                <>
                    <h2 className="text-3xl font-semibold tracking-tight">Sentiment WordCloud</h2>
                    <div className="border-1 border-gray-300 w-full my-4"></div>

                    {sentimentData ? (
                        <CardContent className="flex-1 flex justify-between gap-4 mx-2 max-h-[480px]">
                          <div className="flex-1 flex flex-col">
                              <div ref={posChartRef} className="w-full h-full" />
                                  <div className="flex items-center justify-center gap-2 mt-3">
                                      <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
                                      <span className="text-xs font-normal">Positive Sentiment</span>
                                  </div>
                              </div>

                              <div className="flex-1 flex flex-col">
                                  <div ref={negChartRef} className="w-full h-full" />
                                  <div className="flex items-center justify-center gap-2 mt-3">
                                      <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                                      <span className="text-xs font-normal">Negative Sentiment</span>
                                  </div>
                              </div>
                      </CardContent>
                    ) : (
                        <div className="flex-1 flex items-center justify-center h-full">
                            <h4 className="text-xl font-semibold tracking-tight">
                                😢 Loading or no data available
                            </h4>
                        </div>
                    )}
                </>
            );
        }
    };

    return (
      <Card className="bg-white p-6 rounded-[20px] border border-[#f8f9fa] shadow-[0px_4px_20px_#ededed80] flex-1 flex flex-col my-2 relative">
            <AnimatePresence mode="wait">
                <motion.div
                    key={cardPage}
                    initial={{ opacity: 0, x: cardPage === 1 ? 100 : -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: cardPage === 1 ? -100 : 100 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full flex flex-col"
                >
                    {renderCardContent()}
                </motion.div>
            </AnimatePresence>
            {cardPage === 0 && (
                <button
                    onClick={() => setCardPage(1)}
                    className="absolute top-1/2 right-[-30px] -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 transition shadow-lg rounded-full w-[60px] h-[60px] flex items-center justify-center z-10"
                    title="Next"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}

            {cardPage === 1 && (
                <button
                    onClick={() => setCardPage(0)}
                    className="absolute top-1/2 left-[-30px] -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 transition shadow-lg rounded-full w-[60px] h-[60px] flex items-center justify-center z-10"
                    title="Back"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}
        </Card>
    );
};

export default SentimentalAnalysisCard;
