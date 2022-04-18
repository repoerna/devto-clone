import { collectionGroup, getDocs, limit, orderBy, where } from "firebase/firestore";
import PostFeed from "../../components/PostFeed"
import UserProfile from "../../components/UserProfile"
import { firestore, getUserWithUsername, postToJSON } from "../../lib/firebase";


export async function getServerSideProps({query}) {
  const {username} = query;

  const userDoc = await getUserWithUsername(username);

  if (!userDoc) {
    return {
        notFound: true,
    };
  }

  let user = null;
  let posts = null;

  if (userDoc) {
    user = userDoc.data();

    if (!userDoc) {
      return {
          notFound: true,
      };
    }

    const postQuery = collectionGroup(
      firestore, 
      "posts", 
      where("uid", "==", user.uid), 
      where('published', '==', true), 
      orderBy('createdAt', 'desc'),
      limit(5));

    posts = (await getDocs(postQuery)).docs.map(postToJSON);
  }

  return {
    props: { user, posts}
  }
}

export default function UserProfilePage({ user, posts }) {
  return (
    <main>
        <UserProfile user={user} />
        <PostFeed posts={posts} />
    </main>
  )
}