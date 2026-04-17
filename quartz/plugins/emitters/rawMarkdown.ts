import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"

export const RawMarkdown: QuartzEmitterPlugin = () => {
  return {
    name: "RawMarkdown",
    getQuartzComponents() {
      return []
    },
    async *emit(ctx, content) {
      for (const [, file] of content) {
        const slug = file.data.slug!
        if (slug.startsWith("tags/")) continue
        yield write({
          ctx,
          content: file.value?.toString() ?? "",
          slug,
          ext: ".md",
        })
      }
    },
    async *partialEmit(ctx, content, _resources, changeEvents) {
      const changedSlugs = new Set<string>()
      for (const changeEvent of changeEvents) {
        if (!changeEvent.file) continue
        if (changeEvent.type === "add" || changeEvent.type === "change") {
          changedSlugs.add(changeEvent.file.data.slug!)
        }
      }

      for (const [, file] of content) {
        const slug = file.data.slug!
        if (!changedSlugs.has(slug)) continue
        if (slug.startsWith("tags/")) continue
        yield write({
          ctx,
          content: file.value?.toString() ?? "",
          slug,
          ext: ".md",
        })
      }
    },
  }
}
