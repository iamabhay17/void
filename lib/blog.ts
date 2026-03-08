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

interface BlogFile {
  /** Relative path from BLOGS_PATH (e.g., "react/hooks-guide.mdx" or "my-post.mdx") */
  relativePath: string;
  /** Absolute path to the file */
  absolutePath: string;
}

function getBlogFilesRecursive(dir: string, basePath: string = ""): BlogFile[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: BlogFile[] = [];

  for (const entry of entries) {
    const relativePath = basePath
      ? path.join(basePath, entry.name)
      : entry.name;
    const absolutePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recursively get files from subdirectories
      files.push(...getBlogFilesRecursive(absolutePath, relativePath));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".mdx") || entry.name.endsWith(".md"))
    ) {
      files.push({ relativePath, absolutePath });
    }
  }

  return files;
}

function getBlogFiles(): BlogFile[] {
  return getBlogFilesRecursive(BLOGS_PATH);
}

function parseBlogFile(blogFile: BlogFile): BlogPost | null {
  const fileContent = fs.readFileSync(blogFile.absolutePath, "utf8");
  const { data, content } = matter(fileContent);

  if (!data.published) {
    return null;
  }

  // Generate slug from relative path, removing extension
  // e.g., "react/hooks-guide.mdx" -> "react/hooks-guide"
  // e.g., "my-post.mdx" -> "my-post"
  const slug = blogFile.relativePath.replace(/\.mdx?$/, "").replace(/\\/g, "/");
  const stats = readingTime(content);

  return {
    slug,
    title: data.title || path.basename(slug),
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
  // Normalize slug to handle both forward slashes and potential differences
  const normalizedSlug = slug.replace(/\\/g, "/");
  const blogFile = files.find((file) => {
    const fileSlug = file.relativePath
      .replace(/\.mdx?$/, "")
      .replace(/\\/g, "/");
    return fileSlug === normalizedSlug;
  });

  if (!blogFile) {
    return null;
  }

  return parseBlogFile(blogFile);
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
