import { fal } from '@fal-ai/client'

function imageElementToFile(imgEl, filename) {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas')
    canvas.width = imgEl.naturalWidth
    canvas.height = imgEl.naturalHeight
    canvas.getContext('2d').drawImage(imgEl, 0, 0)
    canvas.toBlob(
      blob => resolve(new File([blob], filename, { type: 'image/jpeg' })),
      'image/jpeg',
      0.92
    )
  })
}

function blobUrlToFile(blobUrl, filename) {
  return fetch(blobUrl)
    .then(r => r.blob())
    .then(blob => new File([blob], filename, { type: blob.type || 'image/jpeg' }))
}

export async function runAiTribe({ personImage, garmentImage, category, apiKey, onProgress }) {
  fal.config({ credentials: apiKey })

  onProgress?.('Uploading images…')

  let personFile, garmentFile

  if (personImage instanceof HTMLImageElement) {
    personFile = await imageElementToFile(personImage, 'person.jpg')
  } else {
    personFile = await blobUrlToFile(personImage, 'person.jpg')
  }

  if (garmentImage instanceof HTMLImageElement) {
    garmentFile = await imageElementToFile(garmentImage, 'garment.jpg')
  } else {
    garmentFile = await blobUrlToFile(garmentImage, 'garment.jpg')
  }

  const [personUrl, garmentUrl] = await Promise.all([
    fal.storage.upload(personFile),
    fal.storage.upload(garmentFile),
  ])

  onProgress?.('Running AI model…')

  const result = await fal.subscribe('fal-ai/cat-vton', {
    input: {
      human_image_url: personUrl,
      garment_image_url: garmentUrl,
      category,
    },
    onQueueUpdate: update => {
      if (update.status === 'IN_PROGRESS') onProgress?.('Generating…')
    },
  })

  return result.data.image.url
}
