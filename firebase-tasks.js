const firebaseConfig = {
  apiKey: "AIzaSyChzl-aDFuJsE1by_eTJ4gB8mj-mi3N9z8",
  authDomain: "school-todo-giftedu12.firebaseapp.com",
  projectId: "school-todo-giftedu12",
  storageBucket: "school-todo-giftedu12.firebasestorage.app",
  messagingSenderId: "217614688882",
  appId: "1:217614688882:web:69edb27351b49209ecd8eb"
};

(async () => {
  const version = "12.16.0";
  const [{ initializeApp }, { getAuth, signInAnonymously }, { getFirestore, collection, getDocs, doc, writeBatch }] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${version}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${version}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${version}/firebase-firestore.js`)
  ]);

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const user = auth.currentUser || (await signInAnonymously(auth)).user;
  const tasksRef = collection(db, "users", user.uid, "tasks");
  let ready = false;

  async function replaceRemote(tasks) {
    const existing = await getDocs(tasksRef);
    const batch = writeBatch(db);
    existing.forEach((item) => batch.delete(item.ref));
    tasks.forEach((task) => batch.set(doc(tasksRef, task.id), { ...task, updatedAt: Date.now() }));
    await batch.commit();
  }

  const remote = (await getDocs(tasksRef)).docs.map((item) => ({ id: item.id, ...item.data() }))
    .map(({ updatedAt, ...task }) => task);
  const cached = (() => { try { return JSON.parse(localStorage.getItem("school-tasks-v1")) || []; } catch { return []; } })();

  if (remote.length === 0 && cached.length > 0) {
    await replaceRemote(cached);
  } else if (remote.length > 0 && JSON.stringify(remote) !== JSON.stringify(cached)) {
    localStorage.setItem("school-tasks-v1", JSON.stringify(remote));
    location.reload();
    return;
  }

  ready = true;
  window.saveSchoolTasks = async (tasks) => {
    if (!ready) return;
    try {
      await replaceRemote(tasks);
    } catch (error) {
      console.error("Firebase ????ㅽ뙣", error);
      alert("?명꽣???곌껐???뺤씤?????ㅼ떆 ?쒕룄??二쇱꽭?? 蹂寃??댁슜? ??湲곌린???꾩떆濡??⑥븘 ?덉뒿?덈떎.");
    }
  };
})().catch((error) => {
  console.error("Firebase ?곌껐 ?ㅽ뙣", error);
  alert("?곗씠?곕쿋?댁뒪 ?곌껐???ㅽ뙣?덉뒿?덈떎. ?명꽣???곌껐???뺤씤??二쇱꽭??");
});

