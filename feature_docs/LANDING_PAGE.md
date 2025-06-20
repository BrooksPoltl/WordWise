# Feature Plan: Professional Marketing Landing Page

## 1. Overview
The goal is to create a professional, engaging marketing landing page for WiseWord. This page will serve as the primary entry point for new, unauthenticated users. It will showcase the app's powerful features, target specific user personas (Product Managers and Software Engineers), and have a clear call-to-action (CTA) to encourage sign-ups.

## 2. Target Audience

The landing page copy and feature showcases will be tailored to resonate with:

*   **Product Managers:** Highlight features that improve clarity in documentation (PRDs, specs) and facilitate better communication.
*   **Software Engineers:** Emphasize tools that help write clear technical documentation, code comments, and pull requests.

## 3. Branding and Color Palette

The landing page will adhere to the application's existing color scheme to ensure brand consistency. The palette is functional, with specific colors assigned to different AI suggestion categories.

*   **Primary Color (Blue):** `#3b82f6`. Used for **Clarity** suggestions. This will be the main accent color for CTAs and key highlights on the landing page.
*   **Secondary Color (Purple):** `#8b5cf6`. Used for **Readability** suggestions. This will be used for secondary accents and to highlight specific features.
*   **Tertiary Colors:**
    *   **Green:** `#10b981` (Conciseness)
    *   **Red:** `#ef4444` (Spelling)
    *   **Yellow:** `#f59e0b` (Passive Voice)
*   **Neutral Palette:** The UI primarily uses a neutral gray scale for text and backgrounds, ensuring that the color-coded highlights are prominent.

---

## 4. Implementation Plan & Tasks

| Priority | Task Description | Implementation Details | Code Pointers | Dependencies | Completion |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **High** | **1. Setup Landing Page Route** | Create a new route for the landing page. This will be the new root (`/`). The existing app will be accessible via a redirect for authenticated users. Modify `App.tsx` to handle this new routing logic. | `src/App.tsx` | `react-router-dom` | ☐ |
| **High** | **2. Create Landing Page Component** | Create a new `LandingPage.tsx` component that will contain all the sections of the landing page. | `src/components/LandingPage.tsx` (new) | - | ☐ |
| **High** | **3. Build Hero Section** | Implement the hero section with the headline, sub-headline, and CTA button. Use the Primary Blue for the main CTA. | `src/components/landing/HeroSection.tsx` (new) | - | ☐ |
| **Medium** | **4. Add Social Proof Section** | Create a section with placeholder logos of tech companies. | `src/components/landing/SocialProof.tsx` (new) | - | ☐ |
| **High** | **5. Build Style Enhancement Feature Section** | Create the section explaining inline suggestions. Use the defined color palette (Primary Blue, Secondary Purple, and Tertiary colors) to visually represent the different suggestion types. Create a simple animation or a high-quality visual (e.g., GIF or video) to demonstrate the feature in action. | `src/components/landing/StyleEnhancementSection.tsx` (new) | - | ☐ |
| **High** | **6. Build AI Rewrites Feature Section** | Create the section for AI-powered rewrites. A "before and after" component would be effective here to show the transformation of text. Use Secondary Purple as an accent color. | `src/components/landing/AIRewritesSection.tsx` (new) | - | ☐ |
| **High** | **7. Build AI Advisory Comments Feature Section** | Create the section for AI advisory comments. Showcase an image of the modal with example suggestions. | `src/components/landing/AIAdvisorySection.tsx` (new) | - | ☐ |
| **Medium** | **8. Build Target Audience Section** | Create a section with two columns, one for Product Managers and one for Software Engineers, with tailored messaging. | `src/components/landing/TargetAudienceSection.tsx` (new) | - | ☐ |
| **Medium** | **9. Build Testimonials Section** | Create a section with placeholder testimonials. | `src/components/landing/TestimonialsSection.tsx` (new) | - | ☐ |
| **High** | **10. Build Final CTA Section & Footer** | Implement the final call-to-action section and a standard footer with links. The CTA should use Primary Blue. | `src/components/landing/CTASection.tsx` (new), `src/components/landing/Footer.tsx` (new) | - | ☐ |
| **High** | **11. Implement Navigation** | Create a simple navigation bar for the landing page with "Log In" and "Sign Up" buttons. The "Sign Up" button should be the Primary Blue. | `src/components/landing/Navbar.tsx` (new) | `react-router-dom` | ☐ |
| **Low** | **12. Add Analytics** | (Optional but recommended) Add basic analytics to track page views and CTA clicks. | `src/components/LandingPage.tsx` | - | ☐ |
| **High** | **13. Responsive Design** | Ensure all sections of the landing page are fully responsive and look great on mobile devices. | All new `landing` components | Tailwind CSS | ☐ | 