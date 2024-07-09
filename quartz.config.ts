import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4.0 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
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
      light: "#ffffff",
      lightgray: "#f0f0f0",
      gray: "#a0a0a0",
      darkgray: "#404040",
      dark: "#202020",
      secondary: "#3a86ff",
      tertiary: "#8338ec",
      highlight: "rgba(58, 134, 255, 0.2)",
      accent: "#ff006e",
    },
       darkMode: {
      light: "#1f2937",
      lightgray: "#374151",
      gray: "#6b7280",
      darkgray: "#d1d5db",
      dark: "#f3f4f6",
      secondary: "#60a5fa",
      tertiary: "#818cf8",
      highlight: "rgba(96, 165, 250, 0.2)",
      accent: "#f472b6",
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
