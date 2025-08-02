# Sripathi Mohanasundaram - Portfolio & Blog

A modern, responsive portfolio website showcasing expertise in Data Engineering, Generative AI, and technical leadership. Built with clean design principles inspired by Dieter Rams' philosophy.

## Features

### Portfolio
- **About Section**: Professional profile highlighting 8+ years of cross-industry data engineering experience
- **Interactive Resume**: Downloadable PDF with detailed work history and education
- **Project Showcase**: Categorized portfolio featuring:
  - Generative AI Projects
  - Machine Learning Solutions
  - Data Engineering Pipelines
  - Data Science Analytics
  - Quantitative Finance Models
  - Design Projects
- **Skills & Certifications**: Technical expertise and professional certifications

### Dynamic Blog System
- **11ty Static Site Generator**: Powered by Eleventy for fast, SEO-friendly content
- **Real-time Search**: Instant filtering through posts, titles, and tags
- **Pagination**: Clean navigation with 6 posts per page
- **Automated Publishing**: Add markdown files to `/blog/` folder for automatic deployment
- **Category Filtering**: Data Engineering, AI & ML, Leadership, Career, Industry insights

### Design & UX
- **Braun-Inspired Design**: Clean, functional aesthetic following Dieter Rams' principles
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Interactive Elements**: Smooth animations, hover effects, and scrolling banner
- **Easter Egg**: Hidden design philosophy showcase for curious visitors
- **Contact Form**: Integrated with Formspree for direct communication

## Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styles with CSS Grid and Flexbox
- **Vanilla JavaScript** - Interactive functionality
- **Ionicons** - Scalable vector icons
- **Google Fonts** - JetBrains Mono & Inter typography

### Static Site Generation
- **11ty (Eleventy)** - Static site generator
- **Nunjucks Templates** - Template engine for layouts
- **Markdown** - Content authoring
- **Syntax Highlighting** - Code block formatting

### Deployment & CI/CD
- **GitHub Pages** - Hosting platform
- **GitHub Actions** - Automated deployment pipeline
- **Node.js 18** - Runtime environment

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm package manager

### Local Development
```bash
# Clone the repository
git clone https://github.com/microize/microize.github.io.git

# Navigate to project directory
cd microize.github.io

# Install dependencies
npm install

# Start development server
npm run serve

# Build for production
npm run build
```

### Adding Blog Posts
1. Create a new markdown file in `/blog/` folder:
   ```
   /blog/2024-08-02-your-post-title.md
   ```

2. Add frontmatter:
   ```markdown
   ---
   title: "Your Post Title"
   date: 2024-08-02
   excerpt: "Brief description of your post"
   tags: ["data-engineering", "leadership"]
   layout: post.njk
   ---

   # Your content here
   ```

3. Commit and push - the post will automatically appear on the blog!

## Project Structure

```
├── blog/                          # Blog posts (markdown files)
├── src/
│   ├── _layouts/
│   │   ├── base.njk              # Base HTML template
│   │   └── post.njk              # Blog post template
│   ├── _includes/
│   │   ├── blog-navbar.njk       # Blog navigation
│   │   ├── navbar.njk            # Main navigation
│   │   └── sidebar.njk           # Sidebar component
├── assets/
│   ├── css/
│   │   └── style.css             # Main stylesheet
│   ├── js/
│   │   └── script.js             # Interactive functionality
│   ├── images/                   # Images and icons
│   └── 00_sripathi_m_data_engineer.pdf  # Resume
├── _site/                        # Generated static site (auto-generated)
├── .eleventy.js                  # 11ty configuration
├── package.json                  # Dependencies and scripts
├── index.html                    # Homepage
└── .github/workflows/
    └── build-and-deploy.yml      # CI/CD pipeline
```

## Design Philosophy

This portfolio follows **Dieter Rams' Ten Principles of Good Design**:
- **Innovative**: Modern web technologies with clean implementation
- **Useful**: Showcases professional work and technical expertise
- **Aesthetic**: Minimalist design with purposeful typography
- **Understandable**: Clear navigation and intuitive user experience
- **Unobtrusive**: Content-first approach with subtle interactions

## Performance Features

- **Fast Loading**: Optimized assets and minimal JavaScript
- **SEO Optimized**: Semantic HTML and meta tags
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Mobile-First**: Responsive design for all screen sizes
- **Progressive Enhancement**: Works without JavaScript

## Live Demo
[Visit the Website](https://sripathim.com)

## Contact
For questions, collaboration, or opportunities:
- **Email**: 3sripathi@gmail.com
- **LinkedIn**: [sripathi-mohanasundaram](https://www.linkedin.com/in/sripathi-mohanasundaram/)
- **GitHub**: [microize](https://github.com/microize)

## License
MIT License - Feel free to use this project as inspiration for your own portfolio.

---

**Built with care and clean code principles**

*Last updated: August 2024*
