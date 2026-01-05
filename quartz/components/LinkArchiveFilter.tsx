import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/linkArchiveFilter.scss"
// @ts-ignore
import script from "./scripts/linkArchiveFilter.inline"

export interface LinkArchiveFilterOptions {
  // No options for now, can be extended later
}

const defaultOptions: LinkArchiveFilterOptions = {}

export default ((userOpts?: Partial<LinkArchiveFilterOptions>) => {
  const LinkArchiveFilter: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    // Only render on link-archive page
    if (fileData.slug !== "link-archive") {
      return null
    }

    return (
      <div class="link-archive-filter">
        <div class="filter-controls">
          <input
            type="text"
            class="search-input"
            placeholder="Search links..."
            id="link-archive-search"
          />
          <select class="category-filter" id="link-archive-category">
            <option value="">All Categories</option>
          </select>
        </div>
        <div class="filter-results-info" id="link-archive-results-info"></div>
      </div>
    )
  }

  LinkArchiveFilter.afterDOMLoaded = script
  LinkArchiveFilter.css = style

  return LinkArchiveFilter
}) satisfies QuartzComponentConstructor

