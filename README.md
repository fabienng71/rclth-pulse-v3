# RCLTH Pulse v3

A comprehensive React-based business management application built with modern technologies, featuring CRM, reporting, procurement, and advanced analytics modules.

## 🚀 Features

### 🏢 Business Modules
- **CRM System**: Complete customer relationship management with lead tracking, activity management, and contact organization
- **Reporting & Analytics**: Real-time business intelligence with interactive dashboards and comprehensive reports
- **Procurement Management**: Supply chain management with inventory tracking and forecasting
- **Quotation System**: Professional quote generation with PDF export and email integration
- **Leave Management**: Employee leave tracking and approval workflows

### 📊 Advanced Analytics
- **Dashboard**: Real-time KPIs and business metrics
- **Sales Analysis**: Detailed sales performance and trend analysis
- **Customer Insights**: Customer behavior and purchase pattern analysis
- **Inventory Reports**: Stock levels, movement, and optimization
- **Executive Reporting**: High-level business performance overview

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with seamless cross-device experience
- **Theme System**: Advanced theming with multiple color schemes
- **Interactive Components**: Rich data tables, calendars, and form controls
- **Professional Interface**: Clean, modern design built with shadcn/ui

## 🛠️ Technology Stack

### Frontend
- **React 18.3** - Modern React with hooks and context
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components

### Backend & Database
- **Supabase** - PostgreSQL database with real-time features
- **Edge Functions** - Serverless functions for backend logic
- **Row Level Security** - Database-level security policies
- **Real-time Subscriptions** - Live data updates

### State Management & Forms
- **Zustand** - Lightweight state management
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation and type safety

### Additional Libraries
- **Lucide React** - Beautiful icon system
- **Date-fns** - Date manipulation utilities
- **Recharts** - Data visualization and charts
- **React Query** - Data fetching and caching

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/fabienng71/rclth-pulse-v3.git
   cd rclth-pulse-v3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
rclth-pulse-v3/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (shadcn/ui)
│   │   ├── crm/            # CRM-specific components
│   │   ├── reports/        # Reporting components
│   │   ├── dashboard/      # Dashboard components
│   │   └── forms/          # Form components
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Application pages/routes
│   ├── services/           # API and business logic
│   ├── stores/             # Zustand state stores
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── integrations/       # External service integrations
├── supabase/
│   ├── functions/          # Edge functions
│   ├── migrations/         # Database migrations
│   └── config.toml         # Supabase configuration
└── public/                 # Static assets
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Code Standards
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Conventional Commits** for commit messages

## 🗄️ Database & Backend

The application uses Supabase for backend services:

### Supabase CLI Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Link to project
npx supabase link --project-ref your_project_ref

# Deploy functions
npx supabase functions deploy --project-ref your_project_ref
```

### Key Database Features
- **PostgreSQL** with advanced querying
- **Row Level Security** for data protection
- **Real-time subscriptions** for live updates
- **Edge functions** for serverless backend logic
- **Migration system** for database versioning

## 🎯 Key Features Deep Dive

### CRM System
- Lead management with pipeline tracking
- Activity logging and scheduling
- Contact management with relationship mapping
- Customer interaction history
- Sales performance analytics

### Reporting Engine
- Interactive dashboards with real-time data
- Customizable report parameters
- Export capabilities (PDF, Excel)
- Scheduled report generation
- Advanced filtering and grouping

### Procurement Module
- Inventory management and tracking
- Purchase order generation
- Supplier management
- Stock level monitoring
- Forecasting and planning

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Other Platforms
- **Netlify**: Build command: `npm run build`, Publish directory: `dist`
- **Docker**: Dockerfile included for containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in `/docs`
- Review the CLAUDE.md file for development guidelines

## 🔄 Version History

- **v3.0.0** - Complete application rewrite with modern stack
- **v2.5** - Enhanced reporting and analytics
- **v2.0** - Initial modular architecture
- **v1.0** - First production release

---

Built with ❤️ using modern web technologies