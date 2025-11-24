# 💪 Fitness Tracker

A modern, offline-first fitness tracking app built with Next.js. Track your workouts, nutrition, and progress with smart analytics—all stored locally on your device.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## ✨ Features

### 🏋️ Workout Tracking
- **5 Training Splits**: Push, Pull, Legs, Core, Run
- **Smart Defaults**: Auto-fills weight from your last session
- **Exercise Analytics**: Track PRs, volume, and progress curves
- **Comprehensive Logbook**: View all your workout history

### 🍽️ Nutrition Tracking
- **Smart Food Parser**: Type "200g chicken" and it calculates macros automatically
- **Kitchen Database**: 65 pre-loaded common foods (Indian + International)
- **Custom Foods**: Add your own foods with custom macros
- **Trend Graphs**: Visualize your calorie and protein intake over time

### 📊 Analytics Dashboard
- **Month at a Glance**: Workouts, sets, and volume stats
- **Consistency Heatmap**: See your workout frequency
- **Muscle Balance Radar**: Ensure balanced training across muscle groups
- **Exercise Deep Dives**: Performance curves and detailed stats per exercise

### 💊 Supplements Tracking
- Time-based checklist (Empty Stomach, Breakfast, Lunch, Dinner, Pre-Workout, Bedtime)
- Progress counter
- Persistent storage

### 📈 Body Metrics
- Daily weight logging
- Progress tracking over time

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
- **Styling**: CSS Variables (Dark mode ready)
- **Charts**: [Recharts](https://recharts.org/)
- **Backend** *(Optional)*: [Supabase](https://supabase.com/) for cloud sync

## 🏃 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/fitness-tracker.git
cd fitness-tracker

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Build for Production

```bash
npm run build
npm start
```

## 📱 Offline-First Design

This app is designed to work **completely offline**. All your data is stored locally in your browser using IndexedDB:

- ✅ No internet required
- ✅ Fast performance
- ✅ Privacy-first (your data stays on your device)
- ✅ Works in gym basements with no signal

### Optional: Cloud Sync

To enable cloud sync across devices:

1. Uncomment `<AuthCheck>` in `app/layout.tsx`
2. Set up a Supabase project
3. Add environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
4. Run the Supabase migrations from `supabase/schema.sql`

## 🎨 Features Highlights

- **Smart Nutrition Parser**: Understands "2 eggs", "200g chicken", "3 rotis"
- **Auto-Seeding**: Kitchen pre-populated with 65 common foods
- **Dark Mode**: Optimized for OLED screens
- **Mobile-First**: Responsive design for gym use
- **No Fluff**: Clean, focused UI for quick logging

## 📂 Project Structure

```
fitness-tracker/
├── app/                    # Next.js app directory
│   ├── analytics/         # Exercise analytics pages
│   ├── dashboard/         # Main dashboard
│   ├── kitchen/           # Food management
│   ├── nutrition/         # Nutrition tracking
│   └── workout/           # Workout logger
├── components/            # React components
│   ├── auth/             # Authentication (optional)
│   ├── dashboard/        # Dashboard components
│   ├── nutrition/        # Nutrition components
│   └── workout/          # Workout components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and database
└── supabase/             # Database schema (optional)
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Icons from [Lucide](https://lucide.dev/)
- Fonts from [Google Fonts](https://fonts.google.com/)

---

**Made with 💪 for serious lifters**
