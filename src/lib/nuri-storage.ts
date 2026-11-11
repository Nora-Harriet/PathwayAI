import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "./firebase";

export type NuriMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  interrupted?: boolean;
};
export type NuriThread = { id: string; title: string };

export function nuriThreadPath(owner: string, id?: string) {
  if (!owner || owner.includes("/") || (id !== undefined && (!id || id.includes("/"))))
    throw new Error("Invalid conversation.");
  return id ? `users/${owner}/nuriThreads/${id}` : `users/${owner}/nuriThreads`;
}
export function nuriOwner() {
  const owner = auth.currentUser?.uid;
  if (!owner) throw new Error("Please sign in to see your conversations.");
  return owner;
}
export function watchNuriThreads(
  owner: string,
  next: (threads: NuriThread[]) => void,
  fail: () => void,
) {
  return onSnapshot(
    query(collection(db, nuriThreadPath(owner)), orderBy("updatedAt", "desc")),
    (snap) =>
      next(
        snap.docs.map((d) => ({
          id: d.id,
          title: String(d.data()["title"] || "New conversation"),
        })),
      ),
    fail,
  );
}
export async function createNuriThread() {
  const ref = doc(collection(db, nuriThreadPath(nuriOwner())));
  const batch = writeBatch(db);
  batch.set(ref, {
    title: "New conversation",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
  return ref.id;
}
export function watchNuriMessages(
  owner: string,
  id: string,
  next: (messages: NuriMessage[]) => void,
  fail: () => void,
) {
  return onSnapshot(
    query(collection(db, `${nuriThreadPath(owner, id)}/messages`), orderBy("position", "asc")),
    (snap) =>
      next(
        snap.docs.map((d) => ({
          id: d.id,
          role: d.data()["role"],
          content: d.data()["content"],
          interrupted: d.data()["interrupted"] === true,
        })),
      ),
    fail,
  );
}
export async function saveNuriMessage(
  owner: string,
  threadId: string,
  message: NuriMessage,
  position: number,
  title?: string,
) {
  if (nuriOwner() !== owner)
    throw new Error("Your account changed. Please reopen this conversation.");
  const path = nuriThreadPath(owner, threadId);
  const batch = writeBatch(db);
  batch.set(doc(db, `${path}/messages`, message.id), {
    ...message,
    interrupted: message.interrupted ?? false,
    position,
    createdAt: serverTimestamp(),
  });
  batch.update(doc(db, path), {
    updatedAt: serverTimestamp(),
    ...(title ? { title: title.slice(0, 70) } : {}),
  });
  await batch.commit();
}
export async function deleteNuriThread(id: string) {
  const path = nuriThreadPath(nuriOwner(), id);
  const messages = await getDocs(collection(db, `${path}/messages`));
  for (let i = 0; i < messages.docs.length; i += 400) {
    const batch = writeBatch(db);
    messages.docs.slice(i, i + 400).forEach((message) => batch.delete(message.ref));
    await batch.commit();
  }
  const batch = writeBatch(db);
  batch.delete(doc(db, path));
  await batch.commit();
}
