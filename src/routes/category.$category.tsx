import { createFileRoute } from '@tanstack/react-router'

import { allPosts } from 'content-collections'

import BlogPosts from '@/components/blog-posts'
import { SITE_URL } from '@/lib/site'

export const Route = createFileRoute('/category/$category')({
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData.category} | Hawaii Public Safety Watch`,
      },
      {
        name: 'description',
        content: `Articles about ${loaderData.category} from Hawaii Public Safety Watch.`,
      },
      { property: 'og:type', content: 'website' },
      {
        property: 'og:url',
        content: `${SITE_URL}/category/${encodeURIComponent(loaderData.category)}`,
      },
      {
        property: 'og:title',
        content: `${loaderData.category} | Hawaii Public Safety Watch`,
      },
      {
        property: 'og:description',
        content: `Articles about ${loaderData.category} from Hawaii Public Safety Watch.`,
      },
      { name: 'twitter:card', content: 'summary_large_image' },
      {
        name: 'twitter:title',
        content: `${loaderData.category} | Hawaii Public Safety Watch`,
      },
      {
        name: 'twitter:description',
        content: `Articles about ${loaderData.category} from Hawaii Public Safety Watch.`,
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: `${SITE_URL}/category/${encodeURIComponent(loaderData.category)}`,
      },
    ],
  }),
  component: RouteComponent,
  loader: async ({ params }) => {
    const category = params.category
    const posts = allPosts.filter((post) => post.categories.includes(category))
    return { category, posts }
  },
})

function RouteComponent() {
  const { category, posts } = Route.useLoaderData()
  return <BlogPosts title={category} posts={posts} />
}
