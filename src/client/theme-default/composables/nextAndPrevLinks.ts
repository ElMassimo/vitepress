import { computed } from 'vue'
import { useSiteDataByRoute, usePageData } from 'vitepress'
import { DefaultTheme } from '../config'

const withoutExtension = (str: string) =>
  str.replace(/(index)?\.(md|html)$/, '')

export function useNextAndPrevLinks() {
  const site = useSiteDataByRoute()
  const page = usePageData()

  const theme = computed(() => site.value.themeConfig || {})

  const candidates = computed(() => getFlatSidebarLinks(theme.value.sidebar))

  const currentPath = computed(
    () => '/' + withoutExtension(page.value.relativePath)
  )

  const currentIndex = computed(() =>
    candidates.value.findIndex((item) => item.link === currentPath.value)
  )

  const next = computed(() => {
    if (
      theme.value.nextLinks !== false &&
      currentIndex.value > -1 &&
      currentIndex.value < candidates.value.length - 1
    ) {
      return candidates.value[currentIndex.value + 1]
    }
  })

  const prev = computed(() => {
    if (theme.value.prevLinks !== false && currentIndex.value > 0) {
      return candidates.value[currentIndex.value - 1]
    }
  })

  const hasLinks = computed(() => !!next.value || !!prev.value)

  return {
    next,
    prev,
    hasLinks
  }
}

function getFlatSidebarLinks(
  sidebar?: DefaultTheme.SideBarConfig
): DefaultTheme.SideBarLink[] {
  if (!sidebar || sidebar === 'auto') {
    return []
  }

  return sidebar.reduce<DefaultTheme.SideBarLink[]>((links, item) => {
    if (item.link) {
      links.push({ text: item.text, link: item.link })
    }

    if ((item as DefaultTheme.SideBarGroup).children) {
      links = [
        ...links,
        ...getFlatSidebarLinks((item as DefaultTheme.SideBarGroup).children)
      ]
    }

    links.forEach((item) => {
      item.link = withoutExtension(item.link)
    })

    return links
  }, [])
}
