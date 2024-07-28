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
          light: "#ffffff",
          lightgray: "#f0f0f0",
          gray: "#808080",
          darkgray: "#404040",
          dark: "#202020",
          secondary: "#404040",
          tertiary: "#606060",
          highlight: "rgba(64, 64, 64, 0.2)",
          accent: "#202020",
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
          accent: "#121212",
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