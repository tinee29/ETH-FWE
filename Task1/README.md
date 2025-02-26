# Web Foundations: HTML + CSS

This exercise focuses on designing web components and layouts using **HTML** and **CSS**. The task involves creating a card component, implementing a responsive page layout, designing a form, adding CSS transitions, and testing for **WCAG 2.1** accessibility compliance.

## What the Code Implements

- **Card Component**: A flexible card design using Flexbox, with rounded edges for images and a footer with action icons.
- **Page Layout**: A responsive dashboard layout using Flexbox and CSS Grid, with a sidebar, header, and scrollable main content.
- **Form**: A responsive form built with CSS Grid, including browser-based validation for inputs.
- **Transitions**: CSS transitions and animations, such as hover effects on navigation items.
- **Accessibility**: A test report for WCAG 2.1 compliance.

---

# Local Development

See [src/README.md](src/README.md) for details.

# Local Testing

## Run Container for Local Testing

```bash
docker build -t my-webapp .

docker run -it --rm -p 5173:5173 my-webapp
