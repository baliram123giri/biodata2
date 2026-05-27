export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishDate: string;
  readTime: string;
  category: string;
  author: string;
  content: string;
}

export const blogPosts: BlogPost[] = [];
