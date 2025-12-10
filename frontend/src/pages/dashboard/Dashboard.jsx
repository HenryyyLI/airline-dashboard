import { AirlineKeyDataSection } from "../../components/Cards/AirlineKeyDataSection";
import { AirlineMappingSection } from "../../components/Cards/AirlineMappingSection";
import FeatureImportanceSection from "../../components/Cards/FeatureImportanceSection";
import RatingDistributionSection from "../../components/Cards/RatingDistributionSection";
import ReviewWordcloudSection from "../../components/Cards/ReviewWordcloudSection";
import SubItemScoringSection from "../../components/Cards/SubItemScoringSection";
import TopRatedAirlinesSection from "../../components/Cards/TopRatedAirlinesSection";

const Dashboard = () => {
    return (
        <div className="flex flex-col gap-2 my-2 mr-2 w-full">

            <div className="grid grid-cols-[5fr_4fr] gap-2">
                <AirlineKeyDataSection />
                <RatingDistributionSection />
            </div>

            <div className="grid grid-cols-[4fr_5fr] gap-2">
                <SubItemScoringSection />
                <ReviewWordcloudSection />
            </div>

            <div className="grid grid-cols-[4fr_5fr] gap-2">
                <TopRatedAirlinesSection />
                
                <div className="grid grid-cols-[6fr_5fr] gap-2">
                    <AirlineMappingSection />
                    <FeatureImportanceSection />
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
