import { useEffect, useState } from 'react';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { database } from '@/lib/firebase';

export function useFirebaseData<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const dataRef = ref(database, path);
    
    const unsubscribe = onValue(dataRef, 
      (snapshot) => {
        setData(snapshot.val());
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [path]);

  return { data, loading, error };
}

export function useFirebaseWrite(path: string) {
  const writeData = async (data: any) => {
    await set(ref(database, path), data);
  };

  const addData = async (data: any) => {
    const newRef = push(ref(database, path));
    await set(newRef, data);
    return newRef.key;
  };

  const deleteData = async () => {
    await remove(ref(database, path));
  };

  return { writeData, addData, deleteData };
}
