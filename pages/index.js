import { collectionGroup, getDocs, limit, orderBy, startAfter, where } from 'firebase/firestore'
import Head from 'next/head'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { useState } from 'react'
import Loader from '../components/Loader'
import PostFeed from '../components/PostFeed'
import { firestore, postToJSON } from '../lib/firebase'
import styles from '../styles/Home.module.css'

const LIMIT = 1;

export async function getServerSideProps(contex) {
  const postQuery = collectionGroup(
    firestore, 
    "posts", 
    where('published', '==', true), 
    orderBy('createdAt', 'desc'),
    limit(LIMIT));

  const posts = (await getDocs(postQuery)).docs.map(postToJSON)

  return {
    props: {posts},
  }
}

export default function Home(props) {
  const [posts, setPosts] = useState(props.posts);
  const [loading, setLoading] = useState(false);
  const [postsEnd, setPostsEnd] = useState(false);
  
  const getMorePost = async () => {
    setLoading(true);

    const last = posts[posts.length - 1]

    const cursor = typeof last.createdAt === 'number' ? last.createdAt : last.createdAt

    const query =  collectionGroup(
      firestore, 
      "post", 
      where('published', '=', true),
      orderBy('createdAt', 'desc'),
      startAfter(cursor),
      limit(LIMIT));

    const newPosts = (await getDocs(query)).docs.map((doc) => doc.data());

    setPosts(posts.concat(newPosts));
    setLoading(false);

    if (newPosts.length < LIMIT) {
      setPostsEnd(true);
    }
  };


  return (
    <main>
      <PostFeed posts={posts} />

      {!loading && !postsEnd && <button onClick={getMorePost}>Load more</button>}

      {postsEnd && "You reached the end! "}

      <Loader show={loading}/>
    </main>
  )
}
