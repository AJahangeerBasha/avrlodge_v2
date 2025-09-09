# Hotel Analytics Dashboard

A comprehensive hotel analytics dashboard built with React, TypeScript, Framer Motion, and Recharts.

## 📍 Location
The dashboard is now integrated into the admin panel at `/admin/dashboard`

## 🎯 Features

### Filter System
- **Present**: Today
- **Future**: Current Week | Next Week | Current Month | Next Month  
- **Past**: Yesterday | Last Week | Last Month
- **Any**: Custom Date Range with date picker

### Dashboard Metrics

#### Rooms & Occupancy
- Total rooms, booked rooms, available rooms
- Check-in/check-out due counts
- Total guests in house
- Occupancy percentages with proper calculations:
  - Present: Potential & Confirmed occupancy
  - Future: Forecasted occupancy  
  - Past: Historical performance

#### Revenue Analysis
- Revenue from rooms (including advance payments)
- Revenue from additional services
- Revenue from rent (editable)
- Gross and net revenue calculations
- Deduction breakdowns

#### Payment Sources
- Cash payments
- Jubair QR payments
- Basha QR payments
- Distribution analysis with visual indicators

#### Refunds & Adjustments
- Cancellation and early checkout refunds
- Percentage and fixed discounts
- Revenue impact analysis

#### Finance Details
- Expected vs actual revenue comparisons
- Guest revenue efficiency metrics
- Net margin calculations
- Performance indicators

### Charts & Visuals
- Line charts for occupancy and revenue trends
- Pie/donut charts for payment methods and room status
- Bar charts for refunds and adjustments
- All with smooth Framer Motion animations

## 🛠 Technical Implementation

### Components
- `HotelAnalyticsDashboard` - Main dashboard component
- `AdminDashboardIntegration` - Integration layer for real data
- `DashboardFilters` - Complete filter system
- `MetricsCard` - Reusable card components
- `RoomStatsCards` - Room occupancy metrics
- `RevenueSummary` - Revenue analysis with editable fields
- `PaymentSources` - Payment method tracking
- `RefundsAdjustments` - Loss analysis
- `FinanceDetails` - Financial performance metrics
- `DashboardCharts` - Interactive charts
- `sampleData.ts` - Realistic sample data generator

### Integration
The dashboard integrates with existing APIs:
- `/api/rooms` - Room data
- `/api/admin/bookings` - Booking information
- `/api/manager/dashboard` - Dashboard statistics

### Data Flow
1. `AdminDashboardIntegration` fetches real data from APIs
2. Transforms real data to dashboard format
3. Falls back to sample data if APIs fail
4. Provides real-time data updates

## 🎨 Design
- Black & white theme with grayscale accents
- Fully responsive design
- Smooth Framer Motion animations
- Modern UX with loading states and error handling

## 📊 Calculations

### Occupancy Formulas
- **Present Potential**: (Booked Rooms / Total Rooms) × 100
- **Present Confirmed**: (Checked-In Rooms / Total Rooms) × 100
- **Future Potential**: (Reserved Rooms / Total Rooms) × 100
- **Future Confirmed**: (Booked Rooms / Total Rooms) × 100
- **Past/Custom Confirmed**: (Rooms Sold / Total Rooms) × 100

### Revenue Formulas
- **Gross Revenue**: Rooms + Additional Services + Rent
- **Net Revenue**: Gross Revenue - (Refunds + Discounts + Salary + Expenses + Bills)
- **Total Refunds & Adjustments**: Refunds + Discounts

## 🚀 Usage

### In Admin Panel
Navigate to `/admin/dashboard` to access the full analytics dashboard with real data integration.

### Standalone Usage
```tsx
import { HotelAnalyticsDashboard } from '@/components/dashboard/HotelAnalyticsDashboard'

export default function MyDashboard() {
  return <HotelAnalyticsDashboard />
}
```

### With Custom Data
```tsx
import { HotelAnalyticsDashboard } from '@/components/dashboard/HotelAnalyticsDashboard'
import { DashboardData } from '@/components/dashboard/sampleData'

export default function MyDashboard() {
  const [data, setData] = useState<DashboardData>()
  
  return (
    <HotelAnalyticsDashboard 
      initialData={data}
      onFilterChange={handleFilterChange}
    />
  )
}
```

## 📱 Responsive Design
- Mobile-first approach
- Optimized for tablets and desktops
- Touch-friendly interactions
- Collapsible sections on smaller screens

## 🔧 Customization
All components are modular and can be customized:
- Modify color schemes in component files
- Adjust metrics calculations in `sampleData.ts`
- Add new chart types using established patterns
- Extend filter options in `DashboardFilters.tsx`

## 🎯 Next Steps
- Add more chart types (heat maps, scatter plots)
- Implement data export functionality
- Add comparative analysis features
- Include forecasting algorithms
- Add user role-based metrics filtering