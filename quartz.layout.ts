import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Darkmode(),
  ],
  footer:     Component.DesktopOnly(Component.Footer(
  //   {
  //   links: {
  //     GitHub: "https://github.com/jackyzha0/quartz",
  //     "Discord Community": "https://discord.gg/cRFFHYye7t",
  //   },
  // }
)),
  // The Graph component is now here, rendered after the main content
  afterBody: [

  ],
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs({
      spacerSymbol: "›", // Use a different spacer
      showCurrentPage: false,
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
    // Show a custom callout only on pages with the 'project' tag
  ],
  left: [
    Component.DesktopOnly(Component.Explorer({
      // Add icons to the explorer
      // mapFn: (node) => {
      //   if (node.file) {
      //     node.displayName = " " + node.displayName
      //   } else {
      //     node.displayName = "📂 " + node.displayName
      //   }
      // },
      // When you click a folder, it will navigate to that folder's page
      folderClickBehavior: "link",
    })),
      Component.DesktopOnly(  Component.RecentNotes({
      title: "Recent",
      limit: 3,
    })),
    // The Graph component has been removed from here
  ],
  right: [
    Component.DesktopOnly(Component.TableOfContents()),
    // Component.Backlinks(),
    Component.DesktopOnly(Component.Graph({
      localGraph: {
        // A more 'floaty' and colorful graph
        repelForce: 0.7,
        linkDistance: 40,
      },
      globalGraph: {
        repelForce: 0.8,
        linkDistance: 30,
      },
    })),
  ],
}

// components for pages that display lists of pages (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    
    // Component.DesktopOnly(Component.Explorer({
    //   // mapFn: (node) => {
    //   //   if (node.file) {
    //   //     node.displayName = "📄 " + node.displayName
    //   //   } else {
    //   //     node.displayName = "📂 " + node.displayName
    //   //   }
    //   // },
    //   folderClickBehavior: "link",
    // })),
  ],
  right: [],
}