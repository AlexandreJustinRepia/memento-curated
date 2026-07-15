# Memento Curated

<p align="center">
  <img src="public/logo.png" alt="Memento Curated logo" width="240" />
</p>

<p align="center">
  <strong>A premium boutique jewelry web experience crafted with Next.js 16, React 19, and Tailwind CSS v4.</strong>
</p>

<p align="center">
  <a href="#getting-started"><strong>Getting Started</strong></a>
  &nbsp;·&nbsp;
  <a href="#tech-stack"><strong>Tech Stack</strong></a>
  &nbsp;·&nbsp;
  <a href="#features"><strong>Features</strong></a>
  &nbsp;·&nbsp;
  <a href="#design-philosophy"><strong>Design</strong></a>
  &nbsp;·&nbsp;
  <a href="#project-structure"><strong>Structure</strong></a>
</p>

---

## Overview

Memento Curated is an elegant, premium web portal built for a boutique jewelry brand. It combines luxury-oriented design with high-performance web architecture, delivering a refined shopping experience through a carefully curated catalog, real-time admin management, and seamless image handling.

The interface adheres to a luxury aesthetic: deep obsidian/charcoal backdrops, refined gold accents, liquid glass refraction, and premium typography pairings.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the storefront.  
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16.2 (Turbopack) |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS v4 (PostCSS) |
| **Language** | TypeScript |
| **Database** | Supabase (PostgreSQL + Storage) |
| **Image Processing** | Sharp (server), Canvas API (client) |
| **Animation** | Framer Motion |

## Features

### Storefront
- **Elegant Catalog Grid** — responsive cards with hover zoom states and category badge identifiers.
- **Interactive Filtering** — real-time category filtering (Rings, Necklaces, Bracelets, Earrings).
- **Dynamic Preview** — built-in admin tooling to preview new pieces and publish directly to the catalog.

### Admin Panel
- **Dashboard** — live visit stats with a 7-day bar chart, orders summary, and quick actions.
- **Product Management** — full CRUD with real-time image upload, client-side resize, WebP conversion, and storage library integration.
- **Image Picker** — choose from storage, upload new files, or paste a URL. Large files are automatically resized to 1200x1200.
- **Storage Management** — direct delete from the Supabase storage library with instant UI feedback.

### Image Handling
- **Client-side resize** for files larger than 2 MB via Canvas API.
- **Server-side optimization** with Sharp (auto-rotate, resize, WebP conversion at 82% quality).
- **Library picker** with thumbnail previews, file sizes, and delete capability.

### Authentication
- Role-based access control (admin / customer).
- Session management with persistent auth state.

## Design Philosophy

- **Color Palette**: Deep Obsidian/Charcoal (`#09090b`) with refined gold accents (`#d4af37`).
- **Layout Structure**: Asymmetric, split-screen Hero section with left-aligned typography and ambient branding.
- **Liquid Glass Refraction**: Bento-grid inspired cards with translucent borders and inner-refractive shadows.
- **Typography**: Premium font pairings optimized for luxury readability.

## Project Structure

```
app/
  page.tsx                 # Storefront landing page
  admin/
    page.tsx               # Admin dashboard
    products/
      page.tsx             # Product management
    components/
      ImagePicker.tsx      # Image selection modal
      Toast.tsx            # Notification component
      Pagination.tsx       # Pagination control
  api/
    admin/
      storage/             # Storage library routes (GET, DELETE)
      products/
        upload/            # Image upload endpoint
      visits/              # Visit statistics endpoint
    products/              # Public product routes
    auth/                  # Authentication routes
supabase/
  sql/                     # Database schema and functions
public/
  logo.png                 # Brand logo
```

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

## License

Private — Memento Curated.
