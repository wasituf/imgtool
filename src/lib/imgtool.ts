import { decode as decodeAvif, encode as encodeAvif } from "@jsquash/avif"
import { decode as decodeJpeg, encode as encodeJpeg } from "@jsquash/jpeg"
import { optimise as encodePng } from "@jsquash/oxipng"
import { decode as decodePng } from "@jsquash/png"
import { decode as decodeWebp, encode as encodeWebp } from "@jsquash/webp"
import { BlobReader, BlobWriter, ZipWriter } from "@zip.js/zip.js"

type FileMetadata = {
  name: string
  size: number
  type: string
  url: string
  id: string
}

type FileWithPreview = {
  file: File | FileMetadata
  id: string
  preview?: string
}

export type FinalFileMetadata = {
  name: string
  size: number
  type: string
  url: string
  buffer: ArrayBuffer
  id: string
}

function generateUrl(imageBuffer: ArrayBuffer, format: string): string {
  const imageBlob = new Blob([imageBuffer], {
    type: `image/${format}`,
  })
  return URL.createObjectURL(imageBlob)
}

function generateName(initialName: string, format: string): string {
  const name = initialName.split(".")
  name.pop()
  return `${name.join(".")}.${format.split("/")[1]}`
}

function generateUniqueId(name: string): string {
  return `${name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

function validateFileFormat(file: File): boolean {
  const supportedFormats = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ]
  return supportedFormats.includes(file.type)
}

async function encode(
  image: ImageData,
  outputFormat: string,
): Promise<ArrayBuffer | undefined> {
  try {
    let imageBuffer: ArrayBuffer | undefined

    switch (outputFormat) {
      case "image/jpeg":
        imageBuffer = await encodeJpeg(image)
        break
      case "image/png":
        imageBuffer = await encodePng(image)
        break
      case "image/webp":
        imageBuffer = await encodeWebp(image)
        break
      case "image/avif":
        imageBuffer = await encodeAvif(image)
        break
    }

    if (!imageBuffer) return
    return imageBuffer
  } catch (error) {
    console.error("Error encoding image.")
    return
  }
}

async function tinypng(
  image: File,
  optimizeLevel: number,
): Promise<ArrayBuffer | undefined> {
  try {
    const imageBuffer = await image.arrayBuffer()
    const optimizedBuffer = await encodePng(imageBuffer, {
      level: optimizeLevel,
    })
    return optimizedBuffer
  } catch (error) {
    console.error("Error optimizing image. ", error)
    return
  }
}

async function decode(image: File): Promise<ImageData | undefined> {
  try {
    const imageBuffer = await image.arrayBuffer()
    const format = image.type

    switch (format) {
      case "image/jpeg":
        return decodeJpeg(imageBuffer)
      case "image/png":
        return decodePng(imageBuffer)
      case "image/webp":
        return decodeWebp(imageBuffer)
      case "image/avif": {
        const decodedImage = await decodeAvif(imageBuffer)
        return decodedImage ?? undefined
      }
      default:
        return
    }
  } catch (error) {
    console.error("Error decoding image. ", error)
    return
  }
}

export async function convert(
  file: FileWithPreview,
  outputFormat: string,
  isTinypng: boolean,
  optimizeLevel: number,
  onComplete: () => void,
): Promise<FinalFileMetadata | undefined> {
  try {
    const imageFile = file.file
    if (!(imageFile instanceof File))
      throw new Error("File is not of type File.")

    if (!validateFileFormat(imageFile)) throw new Error("Invalid file format.")

    if (isTinypng) {
      const buffer = await tinypng(imageFile, optimizeLevel)
      if (!buffer) {
        onComplete()
        return
      }
      const url = generateUrl(buffer, "image/png")
      const name = generateName(imageFile.name, "image/png")
      const id = generateUniqueId(name)
      const size = new Blob([buffer]).size

      onComplete()
      return {
        id,
        size,
        name,
        url,
        buffer: buffer,
        type: "image/png",
      }
    }

    const imageData = await decode(imageFile)
    if (!imageData) {
      onComplete()
      return
    }

    const convertedImageBuffer = await encode(imageData, outputFormat)
    if (!convertedImageBuffer) {
      onComplete()
      return
    }

    const url = generateUrl(convertedImageBuffer, outputFormat)
    const name = generateName(imageFile.name, outputFormat)
    const id = generateUniqueId(name)
    const size = new Blob([convertedImageBuffer]).size

    onComplete()

    return {
      id,
      size,
      name,
      url,
      buffer: convertedImageBuffer,
      type: outputFormat,
    }
  } catch (error) {
    console.error(`Error converting file ${file.file.name}: `, error)
    onComplete()
  }
}

export async function generateZipUrl(
  files: FinalFileMetadata[],
): Promise<string | undefined> {
  try {
    const zipWriter = new ZipWriter(new BlobWriter("application/zip"))

    const zipPromises = files.map((file) => {
      const rawFile = new File([file.buffer], file.name, { type: file.type })
      return zipWriter.add(file.name, new BlobReader(rawFile))
    })

    await Promise.all(zipPromises)

    const zipBlob = await zipWriter.close()

    return URL.createObjectURL(zipBlob)
  } catch (error) {
    console.error("Error generating zip file. ", error)
  }
}
