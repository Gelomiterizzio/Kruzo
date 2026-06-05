import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './config'

export type UploadProgress = { progress: number; url: string | null; error: string | null }

export async function uploadImage(
  file: File,
  path: string,
  onProgress?: (p: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path)
    const task = uploadBytesResumable(storageRef, file, { contentType: file.type })
    task.on('state_changed',
      snap => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      err => reject(err),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        resolve(url)
      }
    )
  })
}

export async function uploadBusinessImages(
  businessId: string, ownerId: string,
  files: File[], type: 'logo' | 'cover' | 'gallery',
  onProgress?: (p: number) => void
): Promise<string[]> {
  const urls: string[] = []
  for (let i = 0; i < files.length; i++) {
    const ext = files[i].name.split('.').pop()
    const path = `businesses/${businessId}/${type}/${Date.now()}_${i}.${ext}`
    const url = await uploadImage(files[i], path, p => {
      const overall = Math.round(((i / files.length) + (p / 100 / files.length)) * 100)
      onProgress?.(overall)
    })
    urls.push(url)
  }
  return urls
}

export async function uploadPostImages(postId: string, files: File[], onProgress?: (p: number) => void): Promise<string[]> {
  const urls: string[] = []
  for (let i = 0; i < files.length; i++) {
    const ext = files[i].name.split('.').pop()
    const path = `posts/${postId}/${Date.now()}_${i}.${ext}`
    const url = await uploadImage(files[i], path, p => {
      onProgress?.(Math.round(((i / files.length) + (p / 100 / files.length)) * 100))
    })
    urls.push(url)
  }
  return urls
}

export async function deleteStorageFile(url: string) {
  try {
    const fileRef = ref(storage, url)
    await deleteObject(fileRef)
  } catch {
    // Ignorar si ya no existe
  }
}
