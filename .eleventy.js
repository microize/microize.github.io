const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  // Add plugins
  eleventyConfig.addPlugin(syntaxHighlight);

  // Ignore files that shouldn't be processed by Eleventy
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("BLOG_README.md");
  eleventyConfig.ignores.add("node_modules/**/*");
  eleventyConfig.ignores.add("_bmad/**/*");
  eleventyConfig.ignores.add("_bmad-output/**/*");

  // Copy static assets
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("*.png");
  eleventyConfig.addPassthroughCopy("*.ico");
  eleventyConfig.addPassthroughCopy("*.pdf");
  eleventyConfig.addPassthroughCopy("CNAME");

  // Date filters
  eleventyConfig.addFilter("dateDisplay", function (date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    }).format(date);
  });

  eleventyConfig.addFilter("dateISO", function (date) {
    return new Date(date).toISOString();
  });

  // Reading time, computed from rendered post HTML (~200 wpm)
  eleventyConfig.addFilter("readingTime", function (html) {
    const text = String(html || "").replace(/(<([^>]+)>)/gi, "");
    const words = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return minutes + " min read";
  });

  // Title-case a hyphenated tag slug ("generative-ai" -> "Generative AI"),
  // keeping known acronyms fully uppercase instead of just their first letter.
  const TITLECASE_ACRONYMS = new Set(["ai", "ui", "ux", "api", "ml", "etl", "sql", "sdk"]);
  eleventyConfig.addFilter("titleCase", function (str) {
    return String(str || "")
      .split("-")
      .filter(Boolean)
      .map((word) => (
        TITLECASE_ACRONYMS.has(word.toLowerCase())
          ? word.toUpperCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ))
      .join(" ");
  });

  // Previous/next post in collections.posts relative to the current URL
  eleventyConfig.addFilter("postNav", function (posts, currentUrl) {
    const idx = posts.findIndex((p) => p.url === currentUrl);
    if (idx === -1) return { prev: null, next: null };
    return { prev: posts[idx + 1] || null, next: posts[idx - 1] || null };
  });

  // Other posts for "More from" lists, excluding the current post
  eleventyConfig.addFilter("otherPosts", function (posts, currentUrl, limit) {
    return posts.filter((p) => p.url !== currentUrl).slice(0, limit || 3);
  });

  // Collections
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("blog/**/*.md").reverse();
  });

  eleventyConfig.addCollection("recentPosts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("blog/**/*.md").reverse().slice(0, 3);
  });

  // Markdown configuration
  const markdownIt = require("markdown-it");
  const markdownItAnchor = require("markdown-it-anchor");

  const markdownLib = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.headerLink()
  });

  // Defer blog post body images (below-the-fold content) with loading="lazy".
  // The home page's hero avatar is plain HTML, not markdown, so it is unaffected
  // and stays eager as intended.
  const defaultImageRenderer = markdownLib.renderer.rules.image || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };
  markdownLib.renderer.rules.image = function (tokens, idx, options, env, self) {
    tokens[idx].attrSet("loading", "lazy");
    return defaultImageRenderer(tokens, idx, options, env, self);
  };

  eleventyConfig.setLibrary("md", markdownLib);

  // Render inline markdown (bold/italic/code) inside frontmatter strings like `excerpt`.
  // Separate instance with linkify off: excerpts render inside a card that is itself an
  // <a>, and linkify would turn plain text (e.g. "Vaidya.ai") into a nested, invalid <a>.
  const markdownInline = markdownIt({ html: false, linkify: false, breaks: false });
  eleventyConfig.addFilter("mdInline", function (str) {
    return markdownInline.renderInline(String(str || ""));
  });

  // Plain-text version of a markdown string, for meta tags / JSON-LD
  eleventyConfig.addFilter("stripMd", function (str) {
    return String(str || "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`(.*?)`/g, "$1");
  });

  const htmlmin = require("html-minifier");
  eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
    if (outputPath && outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }
    return content;
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "src/_includes",
      layouts: "src/_layouts"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};