# TO DO

## Travel Pins Issues

### Z-Index Management
- **Travel pin marker z-index should be lower than modals**
  - **Issue**: Pin markers may appear above modal overlays, creating visual layering conflicts
  - **Priority**: Medium
  - **Status**: Pending
  - **Solution**: Adjust CSS z-index values to ensure proper stacking order
    - Modals should have higher z-index (e.g., z-50 or z-[9999])
    - Pin markers should have lower z-index (e.g., z-10 or z-20)
  - **Files to check**: Travel pins component styling and modal components