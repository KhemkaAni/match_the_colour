# How Well Do You Remember Colours?

A colour memory game built with Next.js, TypeScript, and Tailwind CSS. Test your colour memory across 5 rounds and challenge your friends!

## Project Architecture

```
match_the_colour/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with theme toggle
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Global styles and CSS variables
│   ├── game/
│   │   └── page.tsx        # Main game page (memorize, guess, result phases)
│   ├── results/
│   │   └── page.tsx        # Final results and stats
│   └── challenge/
│       └── page.tsx        # Challenge acceptance page
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── button.tsx      # Button component with variants
│   │   ├── card.tsx        # Card component
│   │   └── input.tsx       # Input component
│   ├── ColorCard.tsx       # Color display and comparison
│   ├── ColorPicker.tsx     # HSL-based color picker with sliders
│   ├── Countdown.tsx       # Circular countdown timer
│   ├── ScoreDisplay.tsx    # Score and accuracy display
│   ├── ChallengeCard.tsx   # Challenge share functionality
│   ├── ModeSelector.tsx    # Game mode selection
│   └── ThemeToggle.tsx     # Dark/light mode toggle
├── lib/
│   ├── colorUtils.ts       # Color conversion utilities (HEX, RGB, HSL, LAB)
│   ├── scoring.ts          # Scoring algorithms (Delta E, accuracy)
│   ├── types.ts            # TypeScript type definitions
│   └── utils.ts            # General utilities (cn, URL generation)
└── store/
    └── gameStore.ts        # Zustand state management
```

### Key Design Decisions

1. **App Router**: Uses Next.js 15 App Router for modern React Server Components support
2. **State Management**: Zustand for lightweight, performant state with localStorage persistence
3. **Color Picker**: Custom HSL-based picker for intuitive color selection
4. **Animations**: Framer Motion for smooth transitions and micro-interactions
5. **Accessibility**: Full keyboard navigation, ARIA labels, and screen reader support

## Scoring Algorithm

### Color Distance Calculation

The scoring system uses perceptual color distance based on the CIE76 Delta E formula:

1. **Convert to LAB Color Space**
   - RGB → XYZ → LAB conversion
   - LAB provides perceptually uniform color representation

2. **Calculate Delta E (CIE76)**
   ```
   ΔE = √[(L₁-L₂)² + (a₁-a₂)² + (b₁-b₂)²]
   ```
   - Delta E < 1: Colors are imperceptibly different
   - Delta E 1-2: Perceptible through close observation
   - Delta E 2-10: Perceptible at a glance
   - Delta E > 10: Colors appear distinctly different

3. **Convert to Accuracy Percentage**
   ```
   accuracy = max(0, 100 - normalizedDelta)
   ```
   - Maximum Delta E capped at 100 for normalization
   - Score equals rounded accuracy (0-100 per round)
   - Maximum total score: 500 (5 rounds × 100)

### Why LAB Color Space?

RGB distance doesn't match human perception. Two colors with the same RGB distance can look very different to humans. LAB color space was designed to be perceptually uniform, meaning equal distances in LAB represent equal perceived differences.

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. **Clone or navigate to the project**
   ```bash
   cd match_the_colour
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment to Vercel

### Option 1: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow prompts** to link your project

### Option 2: GitHub Integration

1. Push code to GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel auto-detects Next.js settings
6. Click "Deploy"

### Option 3: Manual Deploy

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `.next` folder** using Vercel's manual deployment

### Environment Variables

No environment variables are required for basic functionality.

## Future Improvements

### Features
- **User Authentication**: Add login to persist scores across devices
- **Leaderboard**: Global/friend leaderboards with real-time updates
- **More Game Modes**:
  - Time attack mode
  - Endless mode with increasing difficulty
  - Color blindness friendly mode
- **Daily Challenges**: New challenge each day with shared results
- **Statistics Dashboard**: Track progress over time
- **Achievements/Badges**: Unlock rewards for milestones

### Technical
- **PWA Support**: Offline play and install to home screen
- **Sound Effects**: Audio feedback for interactions
- **Haptic Feedback**: Vibration on mobile devices
- **Analytics**: Track user engagement and game metrics
- **i18n**: Multi-language support
- **A/B Testing**: Experiment with different scoring algorithms
- **Social Login**: OAuth with Google/Apple/GitHub

### Accessibility
- **High Contrast Mode**: Enhanced visibility options
- **Reduced Motion**: Respect `prefers-reduced-motion`
- **Voice Control**: Navigate game with voice commands

### Performance
- **Image Optimization**: Use Next.js Image component for any images
- **Code Splitting**: Dynamic imports for better initial load
- **Service Worker**: Cache game assets for faster loads

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge

## License

MIT License - feel free to use this project for learning or your own applications.
