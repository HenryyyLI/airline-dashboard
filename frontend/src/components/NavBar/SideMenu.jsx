import React from "react";
import { GrPieChart } from "react-icons/gr";
import { GrLineChart } from "react-icons/gr";
import { GrBarChart } from "react-icons/gr";
import { useNavigate, useLocation } from "react-router-dom";

export default function SideMenu() {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { icon: <GrPieChart />, text: "Dashboard", path: "/" },
        { icon: <GrLineChart />, text: "Review Data", path: "/review-data" },
        { icon: <GrBarChart />, text: "Analytics Tool", path: "/analytics" },
    ];

    return (
        <div className="group sticky top-0 w-[84px] h-[700px] flex flex-col items-center 
            transition-all duration-300 overflow-hidden hover:w-[250px] bg-white 
            mr-2 rounded-lg border border-[#f8f9fa] shadow-[0px_4px_20px_#ededed80]">
            
            <div className="w-full h-[100px] flex items-center justify-center group-hover:justify-start
                transition-all duration-300 relative">
                <img 
                    src="/logo.png" 
                    alt="AirSight Logo" 
                    className="w-15 h-15 group-hover:ml-5"
                />

                <span className="absolute left-22 text-3xl font-semibold opacity-0 
                    transition-opacity duration-100 group-hover:opacity-100">
                    AirSight
                </span>
            </div>

            <div className="w-[80%] h-[2px] bg-black mb-[10px]"></div>

            {menuItems.map((item, i) => {
                const isActive = location.pathname === item.path;

                return (
                    <div onClick={() => navigate(item.path)}
                        key={i} className={`w-[85%] h-[70px] flex items-center justify-center group-hover:justify-start rounded-md
                        transition-all duration-300 relative cursor-pointer
                        ${isActive 
                            ? 'bg-[#5D5FEF] text-white font-bold' 
                            : 'hover:bg-gray-300 hover:text-rose-400'
                        }`}>
                        <span className="text-2xl group-hover:ml-5">{item.icon}</span>
                        <span className="absolute left-16 text-lg opacity-0
                            transition-opacity duration-100 group-hover:opacity-100">
                            {item.text}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
