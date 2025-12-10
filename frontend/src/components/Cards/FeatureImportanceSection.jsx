import { Card, CardContent } from "@/components/ui/card";
import React from "react";

export default function FeatureImportanceSection() {
    const features = [
        { name: "Seat Comfort", value: 0.784, color: "#3b82f6" },
        { name: "Cabin Staff & Service", value: 0.683, color: "#06b6d4" },
        { name: "Food & Beverages", value: 0.423, color: "#8b5cf6" },
        { name: "Inflight Entertainment", value: 0.311, color: "#ec4899" },
        { name: "Ground Service", value: 0.269, color: "#f59e0b" },
        { name: "Wifi Connectivity", value: 0.199, color: "#3b82f6" },
        { name: "Value for Money", value: 0.112, color: "#8b5cf6" },
    ];

    return (
        <Card className="bg-white rounded-[20px] border border-[#f8f9fa] shadow-[0px_4px_20px_#ededed80]">
            <div className="pl-6 text-xl font-semibold">Feature Importance</div>

            <CardContent className="flex flex-1 min-h-[300px] justify-center items-center">
                <div className="flex flex-col gap-6">
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#0095ff]" />
                                    <span className="text-xs text-gray-500">Seat Comfort</span>
                                </div>
                                <span className="text-base font-semibold">0.784</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#8950fc]" />
                                    <span className="text-xs text-gray-500">{"Food & Beverages"}</span>
                                </div>
                                <span className="text-base font-semibold">0.423</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffa800]" />
                                    <span className="text-xs text-gray-500">Ground Service</span>
                                </div>
                                <span className="text-base font-semibold">0.269</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#00e096]" />
                                    <span className="text-xs text-gray-500">{"Cabin Staff & Service"}</span>
                                </div>
                                <span className="text-base font-semibold">0.683</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#f64e60]" />
                                    <span className="text-xs text-gray-500">Inflight Entertainment</span>
                                </div>
                                <span className="text-base font-semibold">0.311</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#00ab9a]" />
                                    <span className="text-xs text-gray-500">Wifi Connectivity</span>
                                </div>
                                <span className="text-base font-semibold">0.199</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#6d155d]" />
                            <span className="text-xs text-gray-500">Value for Money</span>
                        </div>
                        <span className="text-base font-semibold">0.112</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
