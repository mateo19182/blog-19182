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
          light: "#f5f5f5",         // Soft off-white, less harsh than pure white
          lightgray: "#e6e6e6",     // Lighter gray with a soft, muted tone
          gray: "#a0a0a0",          // Softer mid-gray for better readability
          darkgray: "#707070",      // Darker gray with good contrast
          dark: "#303030",          // Deep charcoal for text and dark elements
          secondary: "#505050",     // Balanced secondary color
          tertiary: "#707070",      // Slightly lighter tertiary tone
          highlight: "rgba(64, 64, 64, 0.1)"  // Very subtle highlight
        },
        darkMode: {
          light: "#0c0c0c",
          lightgray: "#1e1e1e",
          gray: "#b0b0b0",
          darkgray: "#e0e0e0",
          dark: "#f5f5f5",
          secondary: "#1a8c4a",
          tertiary: "#606060",
          highlight: "rgba(255, 255, 255, 0.15)",
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
          light: "github-light",
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