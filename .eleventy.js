const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function(eleventyConfig) {
  // Add plugins
  eleventyConfig.addPlugin(syntaxHighlight);

  // Ignore files that shouldn't be processed by Eleventy
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("BLOG_README.md");
  eleventyConfig.ignores.add("node_modules/**/*");

  // Copy static assets
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("*.png");
  eleventyConfig.addPassthroughCopy("*.ico");
  eleventyConfig.addPassthroughCopy("*.pdf");
  eleventyConfig.addPassthroughCopy("CNAME");

  // Date filters
  eleventyConfig.addFilter("dateDisplay", function(date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    }).format(date);
  });

  eleventyConfig.addFilter("dateISO", function(date) {
    return new Date(date).toISOString();
  });

  // Collections
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("blog/**/*.md").reverse();
  });

  eleventyConfig.addCollection("recentPosts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("blog/**/*.md").reverse().slice(0, 3);
  });

  // Search collection (without templateContent)
  eleventyConfig.addCollection("searchPosts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("blog/**/*.md").map(post => ({
      title: post.data.title,
      excerpt: post.data.excerpt || "",
      url: post.url,
      date: post.data.date,
      tags: post.data.tags || []
    }));
  });

  // Custom filters
  eleventyConfig.addFilter("excerpt", function(post) {
    const content = post.replace(/(<([^>]+)>)/gi, "");
    return content.substr(0, 200) + (content.length > 200 ? "..." : "");
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
  
  eleventyConfig.setLibrary("md", markdownLib);

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