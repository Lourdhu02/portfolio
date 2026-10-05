import { defineConfig, s } from 'velite'

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true
  },
  collections: {
    posts: {
      name: 'Post',
      pattern: 'writing/**/*.mdx',
      schema: s.object({
        title: s.string().max(99),
        summary: s.string(),
        date: s.isodate(),
        tags: s.array(s.string()).default([]),
        cover: s.image().optional(),
        draft: s.boolean().default(false),
        content: s.markdown()
      }).transform(data => ({ ...data, slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))
    }
  }
})
