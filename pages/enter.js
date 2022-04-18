import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getDoc, doc, addDoc, collection, writeBatch } from "firebase/firestore";
import debounce from "lodash.debounce";
import { useState, useEffect, useCallback, useContext } from "react";
import { UserContext } from "../lib/context";
import { auth, firestore } from "../lib/firebase";

export default function EnterPage() {
  const {user, username} = useContext(UserContext);

  console.log(user);

  return (
    <main>
      {user ? 
        !username ? <UsernameForm /> : <SignOutButton />
        :
        <SignInButton />
      }
    </main>
  );
}

function SignInButton() {
  const signInWithGoogle = async () => {
    // try catch to handle errors
    await signInWithPopup(auth, new GoogleAuthProvider());
  };

  return (
    <button className="btn-google" onClick={signInWithGoogle}>
      <img src={'/google.png'} /> Sign in with Google
    </button>
  )
}

function SignOutButton() {
  return <button onClick={() => auth.signOut()}>Sign Out</button>

}

function UsernameForm() {
  const [formValue, setFormValue] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const {user, username} = useContext(UserContext);

  useEffect(() => {
    checkUsername(formValue);
  }, [formValue]);

  const onChange = (e) => {
    const val = e.target.value.toLowerCase();
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

    if (val.length < 3) {
      setFormValue(val);
      setLoading(false);
      setIsValid(false);
    }

    if (re.test(val)) {
      setFormValue(val);
      setLoading(true);
      setIsValid(false);
    }

  }

  const onSubmit = async (e) => {
    e.preventDefault();

    const userDoc = doc(firestore, `users/${user.uid}`);
    const usernameDoc = doc(firestore, `usernames/${formValue}`);

    const batch = writeBatch(firestore);

    batch.set(userDoc, {username: formValue, photoURL: user.photoURL, displayName: user.displayName});
    batch.set(usernameDoc, {uid: user.uid});
    
    await batch.commit();
  }

  const checkUsername = useCallback(
    debounce(async (username) => {
      console.log(username);

      if (username.length >=3){
        const docSnap = await getDoc(doc(firestore,`usernames`, username));
        console.log('Firestore executed');
        setIsValid(!docSnap.exists());
        setLoading(false)
      }
    }, 500),
    []
  );

  function UsernameMessage({username, isValid, loading}) {
    if (loading) {
      return <p>Checking username...</p>
    } else if (isValid) {
      return <p className="text-success">Username is available</p>
    } else if (username && !isValid) {
      return <p className="text-danger">Username is taken</p>
    } else {
      return <p></p>
    }
  }

  return (
    !username && (
      <section>
        <h3>
          Choose Username
        </h3>
        <form onSubmit={onSubmit}>
          <input name="username" placeholder="username" value={formValue}  onChange={onChange} />
          
          <UsernameMessage username={formValue} isValid={isValid} loading={loading} / >
          <button type="submit" className="btn-green" disabled={!isValid}>
            Choose
          </button>

          <h3>
            Debug State
          </h3>
          <div>
            Username: {formValue}
            <br />
            Loading: {loading.toString()}
            <br />
            Username valid: {isValid.toString()}
          </div>
        </form>
      </section>
    )
  );
}