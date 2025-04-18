import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "blog-19182",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: 'umami',
      host: 'https://umami.m19182.dev',
      websiteId: '23e4acbd-b580-49f5-8582-40c77218c6cc'
    },
    locale: "en-US",
    baseUrl: "https://blog.m19182.dev",
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
          highlight: "rgba(64, 64, 64, 0.1)",  // Very subtle highlight
          textHighlight: "#fff23688", // Subtle yellow highlight (from default)
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
          textHighlight: "#b3aa0288", // Subtle highlight for dark mode (from default)
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
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
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
