import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  published: boolean;
  tags: string[];
  readingTime: string;
  content: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  published: boolean;
  tags: string[];
  readingTime: string;
}

const BLOGS_PATH = path.join(process.cwd(), "content/blogs");

function getBlogFiles(): string[] {
  if (!fs.existsSync(BLOGS_PATH)) {
    return [];
  }
  return fs
    .readdirSync(BLOGS_PATH)
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"));
}

function parseBlogFile(filename: string): BlogPost | null {
  const filePath = path.join(BLOGS_PATH, filename);
  const fileContent = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContent);

  if (!data.published) {
    return null;
  }

  const slug = filename.replace(/\.mdx?$/, "");
  const stats = readingTime(content);

  return {
    slug,
    title: data.title || slug,
    description: data.description || "",
    date: data.date
      ? new Date(data.date).toISOString()
      : new Date().toISOString(),
    published: data.published ?? false,
    tags: data.tags || [],
    readingTime: stats.text,
    content,
  };
}

export function getAllBlogs(): BlogPostMeta[] {
  const files = getBlogFiles();
  const blogs = files
    .map((file) => parseBlogFile(file))
    .filter((blog): blog is BlogPost => blog !== null)
    .map(({ content, ...meta }) => meta)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return blogs;
}

export function getBlogBySlug(slug: string): BlogPost | null {
  const files = getBlogFiles();
  const filename = files.find((file) => file.replace(/\.mdx?$/, "") === slug);

  if (!filename) {
    return null;
  }

  return parseBlogFile(filename);
}

export function getTopBlogs(count: number = 3): BlogPostMeta[] {
  return getAllBlogs().slice(0, count);
}

export interface PaginatedBlogs {
  blogs: BlogPostMeta[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function getPaginatedBlogs(
  page: number = 1,
  limit: number = 10,
): PaginatedBlogs {
  const allBlogs = getAllBlogs();
  const total = allBlogs.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const blogs = allBlogs.slice(offset, offset + limit);

  return {
    blogs,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export function getAllTags(): string[] {
  const blogs = getAllBlogs();
  const tags = new Set<string>();
  blogs.forEach((blog) => {
    blog.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}
