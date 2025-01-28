import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

const config: QuartzConfig = {
  configuration: {
    pageTitle: "blog-19182",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "tinylytics", siteId: "xGC1QbQFwc96LoYHDRM9"
    },
    locale: "en-US",
    baseUrl: "blog.m19182.dev",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "created",
    generateSocialImages: true,
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Poppins",
        body: "Inter",
        code: "Fira Code",
      },
      colors: {
        lightMode: {
          light: "#1e1e1e",         // Darker base
          lightgray: "#2d2d2d",     // Darker light gray
          gray: "#808080",          // Muted gray
          darkgray: "#a0a0a0",      // Lighter dark gray for contrast
          dark: "#d0d0d0",          // Light text for dark background
          secondary: "#909090",      // Muted secondary
          tertiary: "#707070",      // Darker tertiary
          highlight: "rgba(255, 255, 255, 0.1)",  // Subtle highlight
          textHighlight: "#1e1e1e", // Dark text for highlights
        },
        darkMode: {
          light: "#0a0a0a",         // Even darker background
          lightgray: "#1a1a1a",     // Very dark gray
          gray: "#909090",          // Balanced gray
          darkgray: "#d0d0d0",      // Light gray for text
          dark: "#f0f0f0",          // Light text
          secondary: "#1a8c4a",     // Keep the accent color
          tertiary: "#505050",      // Darker tertiary
          highlight: "rgba(255, 255, 255, 0.12)", // Subtle highlight
          textHighlight: "#0a0a0a", // Very dark text for highlights
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-dark",     // Changed to dark theme for both modes
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config