interface LinkItem {
  element: HTMLElement
  title: string
  url: string
  category: string
  date: string
}

function parseLinkItem(li: HTMLElement): LinkItem | null {
  const link = li.querySelector("a")
  if (!link) return null

  const title = link.textContent?.trim() || ""
  const url = link.getAttribute("href") || ""

  // Extract category from <code> tag (rendered from backticks)
  // Fallback to regex if code element not found
  let category = ""
  const codeElement = li.querySelector("code")
  if (codeElement) {
    category = codeElement.textContent?.trim() || ""
  } else {
    // Fallback: try regex on text content
    const categoryMatch = li.textContent?.match(/`([^`]+)`/)
    category = categoryMatch ? categoryMatch[1] : ""
  }

  return {
    element: li,
    title,
    url,
    category,
    date: "", // Not used anymore, but keeping for interface compatibility
  }
}

function setupLinkArchiveFilter() {
  // Only run on link-archive page
  const currentPath = window.location.pathname
  if (!currentPath.includes("link-archive")) {
    return null
  }

  const filterContainer = document.querySelector(".link-archive-filter") as HTMLElement
  if (!filterContainer) {
    return null
  }

  const searchInput = document.getElementById("link-archive-search") as HTMLInputElement
  const categoryFilter = document.getElementById("link-archive-category") as HTMLSelectElement
  const resultsInfo = document.getElementById("link-archive-results-info")

  if (!searchInput || !categoryFilter || !resultsInfo) {
    return null
  }

  const article = document.querySelector("article.popover-hint")
  if (!article) {
    return null
  }

  // Find the first list item or ul element to insert the filter before it
  const firstListItem = article.querySelector("li")
  const firstUl = article.querySelector("ul")
  const insertBefore = firstListItem || firstUl

  // Move the filter container to appear right before the links
  if (insertBefore && insertBefore.parentNode) {
    insertBefore.parentNode.insertBefore(filterContainer, insertBefore)
  }

  const listItems = Array.from(article.querySelectorAll("li"))
  const linkItems: LinkItem[] = []

  // Parse all list items
  for (const li of listItems) {
    const item = parseLinkItem(li as HTMLElement)
    if (item) {
      linkItems.push(item)
      // Store metadata as data attributes for filtering
      li.setAttribute("data-link-title", item.title.toLowerCase())
      li.setAttribute("data-link-url", item.url.toLowerCase())
      li.setAttribute("data-link-category", item.category)
    }
  }

  // Collect unique categories
  const categories = new Set<string>()

  linkItems.forEach((item) => {
    if (item.category) {
      categories.add(item.category)
    }
  })

  // Populate category filter
  const sortedCategories = Array.from(categories).sort()
  sortedCategories.forEach((category) => {
    const option = document.createElement("option")
    option.value = category
    option.textContent = category
    categoryFilter.appendChild(option)
  })

  function updateResultsCount(visibleCount: number, totalCount: number) {
    if (visibleCount === totalCount) {
      resultsInfo.textContent = `Showing all ${totalCount} links`
    } else {
      resultsInfo.textContent = `Showing ${visibleCount} of ${totalCount} links`
    }
  }

  function filterLinks() {
    const searchTerm = searchInput.value.toLowerCase().trim()
    const selectedCategory = categoryFilter.value

    let visibleCount = 0
    const totalCount = linkItems.length

    linkItems.forEach((item) => {
      const matchesSearch =
        !searchTerm || item.title.toLowerCase().includes(searchTerm)
      const matchesCategory = !selectedCategory || item.category === selectedCategory

      const shouldShow = matchesSearch && matchesCategory

      if (shouldShow) {
        item.element.style.display = ""
        visibleCount++
      } else {
        item.element.style.display = "none"
      }
    })

    updateResultsCount(visibleCount, totalCount)
  }

  // Attach event listeners
  searchInput.addEventListener("input", filterLinks)
  categoryFilter.addEventListener("change", filterLinks)

  // Initial count
  updateResultsCount(linkItems.length, linkItems.length)

  // Cleanup function
  return () => {
    searchInput.removeEventListener("input", filterLinks)
    categoryFilter.removeEventListener("change", filterLinks)
  }
}

// Initialize on page load
let cleanup: (() => void) | null = null

function initFilter() {
  if (cleanup) {
    cleanup()
  }
  cleanup = setupLinkArchiveFilter()
}

// Handle initial page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFilter)
} else {
  initFilter()
}

// Handle SPA navigation (Quartz uses client-side routing)
document.addEventListener("nav", () => {
  // Small delay to ensure DOM is ready
  setTimeout(initFilter, 100)
})

// Cleanup on page unload
window.addCleanup(() => {
  if (cleanup) {
    cleanup()
  }
})

