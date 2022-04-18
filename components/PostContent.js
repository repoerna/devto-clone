import Link from "next/link";
import ReactMarkdown from 'react-markdown';

export default function PostContent({ post }) {

    const createdAt = typeof post?.createdAt === 'number' ? new Date(post.createdAt) : post.createdAt;

  return (
    <div className="card">
        <h1>
            { post?.title }
        </h1>
        <span className="test-sm">
            Written by {' '}
            <Link href={`/${post?.username}`}>
                <a className="text-info">@{post?.username}</a>
            </Link> {' '}

            on {createdAt.toISOString}
        </span>

        <ReactMarkdown>
            {post?.content}
        </ReactMarkdown>
    </div>
  )
}