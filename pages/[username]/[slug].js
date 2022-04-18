import { collection, collectionGroup, doc, getDoc, getDocs, query, Query, where } from "firebase/firestore";
import PostContent from "../../components/PostContent";
import styles from '../../styles/Post.module.css';
import { firestore, getUserWithUsername, postToJSON } from "../../lib/firebase";
import { useDocumentData } from 'react-firebase-hooks/firestore';



export async function getStaticProps({params}) {
    const {username, slug} = params;

    const userDoc = await getUserWithUsername(username);

    if (!userDoc) {
        return {
            notFound: true,
        };
    }

    let user = null;
    let path = null;
    let post = null;

    if (userDoc) {
        user = userDoc.data();

        const userRef = collection(firestore, userDoc.ref.path, "posts")
        const postRef = doc(firestore, userRef.path, slug)
        const postDoc = await getDoc(postRef);

        post = postToJSON(postDoc);
        path = postRef.path;
    }

    return {
        props: { post, path },
        revalidate: 5000,
    };
}

export async function getStaticPaths() {
    const snapshot = await getDocs(collectionGroup(firestore, 'posts'))
    const paths = snapshot.docs.map((doc) => {
        const { slug, username } = doc.data();
        return {
            params: { username, slug },
        }
    });

    return {
        paths,
        fallback: 'blocking',
    }
}

export default function PostPage(params) {

    const postRef =  doc(firestore, params.path);
    console.log(postRef)
    const [realtimePost] = useDocumentData(postRef);

    const post = realtimePost || params.post;
  return (
    <main className={styles.container}>
        <section>
            <PostContent post={post} />
        </section>

        <aside className="card">
            <p>
                <strong>{ post.heartCount || 0 } Hearts</strong>
            </p>
        </aside>

    </main>
  )
}