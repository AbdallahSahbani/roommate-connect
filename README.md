# LiveBigger - Roommate Matching & Real Estate Platform

A full-stack web application for matching roommates and finding rental properties with AI-powered compatibility scoring and comprehensive verification.

## Features

- 🔐 **Secure Authentication** - Email/password with 3-day free trial
- ✅ **Complete Verification System**
  - Government ID verification (front & back upload)
  - Face scan verification via webcam
  - Income verification with document upload
- 🤝 **AI Roommate Matching** - Compatibility scoring based on lifestyle preferences
- 🏠 **Property Listings** - Browse and apply to rental properties
- 💬 **In-App Messaging** - Chat with potential roommates and landlords
- 💳 **Free Subscription Model** - No payment required (Stripe replaced with free system)
- 📊 **Comprehensive Dashboard** - Track verification status and activity

## Quick Start Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser to http://localhost:8080
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navigation.tsx   # Main navigation bar
│   ├── SubscriptionBanner.tsx  # Trial status banner
│   └── ui/             # shadcn/ui components
├── pages/              # Route pages
│   ├── Landing.tsx     # Homepage
│   ├── Auth.tsx        # Login/Signup
│   ├── ProfileSetup.tsx # User profile creation
│   ├── Verification.tsx # ID, Face, Income verification
│   ├── Dashboard.tsx   # Main user dashboard
│   ├── Browse.tsx      # Roommate matching
│   ├── Properties.tsx  # Property listings
│   ├── Messages.tsx    # In-app chat
│   └── Subscription.tsx # Free subscription activation
├── integrations/
│   └── supabase/       # Supabase client & types
└── App.tsx             # Main app router
```

## Key Features

### Verification System
1. **ID Verification**: Upload government ID (front & back)
2. **Face Scan**: Webcam selfie capture with camera API
3. **Income Verification**: Upload pay stubs with income amount

### Free Subscription Model
- 3-day free trial for new users
- Activate unlimited FREE subscription after trial
- No payment processing required
- Track status in profiles table

### AI Compatibility Matching
Rule-based algorithm considers:
- Budget overlap
- Move-in date alignment
- Lifestyle preferences
- Social compatibility
- Pet/smoking preferences

### Database Tables
- `profiles` - User data with subscription tracking
- `user_roles` - Role-based access control
- `verifications` - ID, face, income verification
- `properties` - Rental listings
- `groups` - Roommate groups
- `messages` - In-app messaging
- `compatibility_scores` - AI matching scores

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Environment Variables

All environment variables are automatically configured by Lovable Cloud:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

No manual configuration needed!

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui
- **Backend**: Supabase (via Lovable Cloud)
- **Database**: PostgreSQL with RLS
- **Authentication**: Supabase Auth

Built with ❤️ using Lovable

---

# Original Lovable Project Info

## Project info

**URL**: https://lovable.dev/projects/27c22f7b-4f07-4c11-b54a-26936d2d3c09

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/27c22f7b-4f07-4c11-b54a-26936d2d3c09) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/27c22f7b-4f07-4c11-b54a-26936d2d3c09) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
