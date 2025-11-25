import React from "react";
import {useIntl} from "react-intl";
import {usePaginationStore, useCategoryStore, usePostTagsStore, useAuthStore} from "../../stores";
import {useNavigate, useLocation} from "react-router";
import CategoryIcon from "../CategoryIcon";

export default function EnhancedMobileNav({categories, onNavigate, showCategories = true}) {
    const intl = useIntl();
    const navigate = useNavigate();
    const location = useLocation();
    const isOnTravelPinsPage = location.pathname === '/travel-pins-new';
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const categoryId = useCategoryStore((state) => state.categoryId);
    const setCategoryId = useCategoryStore((state) => state.setCategoryId);
    const setCurrentPage = usePaginationStore((state) => state.setCurrentPage);
    const setTags = usePostTagsStore((state) => state.setTags);

    const resetFilters = () => {
        setCategoryId(null);
        setTags([]);
        setCurrentPage(null);
    };

    const handleCategoryClick = (id) => {
        navigate('/');
        setCategoryId(id);
        setCurrentPage(null);
        setTags([]);
        if (onNavigate) onNavigate();
    };

    const handleHomeClick = () => {
        resetFilters();
        navigate("/");
        if (onNavigate) onNavigate();
    };

    const handleAboutClick = () => {
        resetFilters();
        navigate("/about");
        if (onNavigate) onNavigate();
    };

    const handleTravelPinsClick = () => {
        resetFilters();
        navigate("/travel-pins-new");
        if (onNavigate) onNavigate();
    };

    const handleMotionDetectorClick = () => {
        resetFilters();
        navigate("/motion-detector");
        if (onNavigate) onNavigate();
    };

    const getIsCurrentCategory = (id) => {
        return parseInt(categoryId) === parseInt(id);
    };

    // Navigation Item Component
    const NavItem = ({href, icon, children, count, onClick, isActive = false}) => {
        return (
            <button
                onClick={onClick}
                className={`flex items-center justify-between w-full px-4 py-3 text-left transition-colors duration-200 ${
                    isActive 
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
            >
                <div className="flex items-center space-x-3">
                    <span className="text-lg flex-shrink-0">{icon}</span>
                    <span className="font-medium">{children}</span>
                </div>
                {count && (
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
                        {count}
                    </span>
                )}
            </button>
        );
    };

    // Section Header Component
    const SectionHeader = ({children}) => {
        return (
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-100 border-b border-gray-200">
                {children}
            </div>
        );
    };

    return (
        <div className="bg-white border-t border-gray-200 shadow-lg">
            {/* Main Navigation Section */}
            <div className="border-b border-gray-100">
                <SectionHeader>
                    {intl.formatMessage({id: "nav.main_navigation", defaultMessage: "Main Navigation"})}
                </SectionHeader>
                
                <NavItem 
                    icon="🏠" 
                    onClick={handleHomeClick}
                    isActive={!categoryId && window.location.pathname === '/'}
                >
                    {intl.formatMessage({id: "nav.home", defaultMessage: "Home"})}
                </NavItem>
                
                <NavItem 
                    icon="👋" 
                    onClick={handleAboutClick}
                    isActive={window.location.pathname === '/about'}
                >
                    {intl.formatMessage({id: "nav.about_me_button", defaultMessage: "About Me"})}
                </NavItem>
                
                <NavItem 
                    icon="📍" 
                onClick={handleTravelPinsClick}
                isActive={window.location.pathname === '/travel-pins-new'}
            >
                Travel Pins
            </NavItem>

            {isLoggedIn && (
                <NavItem
                    icon="📳"
                    onClick={handleMotionDetectorClick}
                    isActive={window.location.pathname === '/motion-detector'}
                >
                    {intl.formatMessage({id: "nav.motion_detector", defaultMessage: "Motion Detector"})}
                </NavItem>
            )}
            </div>

            {/* Article Categories Section */}
            {showCategories && categories && categories.length > 0 && (
                <div className="border-b border-gray-100">
                    <SectionHeader>
                        {intl.formatMessage({id: "nav.article_categories", defaultMessage: "Article Categories"})}
                    </SectionHeader>
                    
                    {categories.map(({id, category_name, post_count}) => (
                        <NavItem
                            key={id}
                            icon={<CategoryIcon category_id={id} />}
                            onClick={() => handleCategoryClick(id)}
                            count={post_count}
                            isActive={getIsCurrentCategory(id)}
                        >
                            {category_name}
                        </NavItem>
                    ))}
                </div>
            )}

        </div>
    );
}
