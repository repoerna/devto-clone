import { collection, doc, getDocs, orderBy, query, setDoc } from "firebase/firestore";
import { connectStorageEmulator } from "firebase/storage";
import kebabCase from "lodash.kebabcase";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { useCollection, useCollectionData } from "react-firebase-hooks/firestore";
import toast from "react-hot-toast";
import AuthCheck from "../../components/AuthCheck";
import PostFeed from "../../components/PostFeed";
import { UserContext } from "../../lib/context";
import { auth, firestore, serverTimeStamp } from "../../lib/firebase";
import styles from '../../styles/Post.module.css';

export default function AdminPage({ }) {
  return (
    <main>
      <AuthCheck>
        <PostList />
        <CreateNewPost />
      </AuthCheck>
        
    </main>
  )
}

function PostList() {
  const userRef = collection(firestore, doc(firestore, 'users', auth.currentUser.uid).path, 'posts');
  const q = query(collection(firestore, userRef.path), orderBy('createdAt', 'desc'));
  const [querySnapshot] = useCollection(q); 

  console.log(querySnapshot?.docs)
  const posts = querySnapshot?.docs.map(doc => doc.data());
  console.log(posts)

  return (
    <>
      <h1>Manage your post</h1>
      <PostFeed posts={posts} admin />
    </>
  )

}


function CreateNewPost() {
  const router = useRouter();
  const { username } = useContext(UserContext);
  const [title, setTitle] = useState('');

  const slug = encodeURI(kebabCase(title));

  const isValid = title.length > 3 && title.length < 100; 

  const createPost = async (e) => {
    e.preventDefault();
  
    const uid = auth.currentUser.uid;
    const userRef = collection(firestore, doc(firestore, 'users', auth.currentUser.uid).path, 'posts');
  
    const data = {
      title,
      slug,
      uid,
      username,
      published: false,
      content: '# Hello World!',
      createdAt: serverTimeStamp,
      updatedAt: serverTimeStamp,
    }
  
    await setDoc(doc(firestore, userRef.path, slug), data);
  
    toast.success('Post created!');
  
    router.push(`/admin/${slug}`);
  }
  

  return (
    <form onSubmit={createPost}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className={styles.input}
      />
      <p>
        <strong>Slug:</strong> {slug}
      </p>

      <button type="submit" disabled={!isValid} className="btn-green">
        Create New Post
      </button>

    </form>
  )
}


