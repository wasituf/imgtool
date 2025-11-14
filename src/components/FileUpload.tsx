import {
  AlertCircleIcon,
  CircleHelpIcon,
  DownloadIcon,
  ImageDownIcon,
  ImageIcon,
  PlusIcon,
  RocketIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react"
import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Toggle } from "@/components/ui/toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload"
import { convert, type FinalFileMetadata, generateZipUrl } from "@/lib/imgtool"
import { Spinner } from "./ui/spinner"

export default function FileUpload() {
  const maxSize = 20 * 1024 * 1024 // 20MB default
  const maxFiles = 10
  const zipName = "imgtool"
  const defaultTinypngLevel = 3
  const maxTinypngLevel = 5
  const minTinypngLevel = 1

  const [outputFormat, setOutputFormat] = useState("image/webp")
  const [isTinypng, setIsTinypng] = useState(false)
  const [tinypngLevel, setTinypngLevel] = useState([defaultTinypngLevel])

  const [convertedFiles, setConvertedFiles] = useState<FinalFileMetadata[]>()
  const [zipUrl, setZipUrl] = useState<string | undefined>()

  const [isConverting, setIsConverting] = useState(false)
  const [conversionProgress, setConversionProgress] = useState(0)

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    accept: isTinypng
      ? "image/png"
      : "image/jpeg,image/png,image/webp,image/avif",
    multiple: true,
    maxFiles,
    maxSize,
  })

  const handleConvert = async () => {
    if (files.length < 1) return
    setIsConverting(true)
    setConversionProgress(0)

    let completedFilesCount = 0
    const totalFiles = files.length

    const onProgress = () => {
      completedFilesCount++
      const newProgress = Math.round((completedFilesCount / totalFiles) * 100)
      setConversionProgress(newProgress)
    }

    const converstionPromises = files.map((file) =>
      convert(file, outputFormat, isTinypng, tinypngLevel[0], onProgress),
    )

    const results = (await Promise.all(converstionPromises)).filter(
      (r): r is FinalFileMetadata => r !== undefined,
    )

    setConvertedFiles(results)

    const zipUrl = await generateZipUrl(results)
    if (zipUrl) setZipUrl(zipUrl)

    setConversionProgress(100)
    setIsConverting(false)
  }

  const handleReset = () => {
    clearFiles()
    setConvertedFiles(undefined)
    setConversionProgress(0)
    setZipUrl(undefined)
  }

  const handleTinypngToggle = () => {
    handleReset()
    setIsTinypng(!isTinypng)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="ms-1 font-bold text-3xl opacity-80">ImgTool</h1>
        <Tooltip>
          <TooltipTrigger>
            <Toggle
              aria-label="Toggle tinyPNG"
              size="sm"
              variant="outline"
              className="scale-x-105 gap-1 px-2 text-foreground/90 transition-all duration-150 data-[state=on]:scale-x-100 data-[state=on]:border-none data-[state=on]:bg-accent-secondary/60 data-[state=on]:font-semibold data-[state=on]:text-accent-foreground/75"
              onPressedChange={handleTinypngToggle}
            >
              <ImageDownIcon className="size-4" /> tinypng
            </Toggle>
          </TooltipTrigger>
          <TooltipContent
            className="border bg-transparent text-secondary-foreground/80"
            side="top"
            align="end"
          >
            Optimize PNGs with extra options.
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex flex-col gap-2">
        {/* Drop area */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          data-files={files.length > 0 || undefined}
          className="flex min-h-56 flex-col items-center not-data-[files]:justify-center rounded-xl border border-input border-dashed p-4 transition-colors has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
        >
          <input
            {...getInputProps()}
            className="sr-only"
            aria-label="Upload images"
          />

          {files.length > 0 ? (
            <div className="flex w-full flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate font-medium text-sm">
                  {conversionProgress === 100 ? "Converted" : "Uploaded"} Images
                  ({files.length})
                </h3>
                {conversionProgress !== 100 && (
                  <Button variant="outline" size="sm" onClick={clearFiles}>
                    {" "}
                    <Trash2Icon
                      className="-ms-0.5 size-3.5 opacity-60"
                      aria-hidden="true"
                    />
                    Remove all
                  </Button>
                )}
              </div>
              <div className="w-full space-y-2">
                <ScrollArea
                  className={`${conversionProgress === 100 || files.length >= maxFiles ? "h-[340px]" : "h-72"}`}
                >
                  <div className="space-y-2">
                    {conversionProgress === 100
                      ? convertedFiles?.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between gap-2 rounded-lg border bg-background p-2 pe-3"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="aspect-square shrink-0 rounded bg-accent">
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="size-10 rounded-[inherit] object-cover"
                                />
                              </div>
                              <div className="flex min-w-0 flex-col gap-0.5">
                                <p className="truncate font-medium text-[13px]">
                                  {file.name}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {formatBytes(file.size)}
                                </p>
                              </div>
                            </div>

                            <Button
                              size="icon"
                              variant="outline"
                              className="size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
                              asChild
                              aria-label="Download file"
                            >
                              <a href={file.url} download={file.name}>
                                <DownloadIcon
                                  className="size-4"
                                  aria-hidden="true"
                                />
                              </a>
                            </Button>
                          </div>
                        ))
                      : files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between gap-2 rounded-lg border bg-background p-2 pe-3"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="aspect-square shrink-0 rounded bg-accent">
                                <img
                                  src={file.preview}
                                  alt={file.file.name}
                                  className="size-10 rounded-[inherit] object-cover"
                                />
                              </div>
                              <div className="flex min-w-0 flex-col gap-0.5">
                                <p className="truncate font-medium text-[13px]">
                                  {file.file instanceof File
                                    ? file.file.name
                                    : file.file.name}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {formatBytes(
                                    file.file instanceof File
                                      ? file.file.size
                                      : file.file.size,
                                  )}
                                </p>
                              </div>
                            </div>

                            <Button
                              size="icon"
                              variant="ghost"
                              className="-me-2 size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
                              onClick={() => removeFile(file.id)}
                              aria-label="Remove file"
                            >
                              <XIcon className="size-4" aria-hidden="true" />
                            </Button>
                          </div>
                        ))}
                  </div>
                </ScrollArea>

                {conversionProgress !== 100 && files.length < maxFiles && (
                  <Button
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={openFileDialog}
                  >
                    <UploadIcon
                      className="-ms-1 opacity-60"
                      aria-hidden="true"
                    />
                    Add more
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <div
                className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
                aria-hidden="true"
              >
                <ImageIcon className="size-4 opacity-60" />
              </div>
              <p className="mb-1.5 font-medium text-sm">Upload Images</p>
              <p className="text-muted-foreground text-xs">
                {isTinypng ? "Add your PNG files" : "PNG, JPG, WEBP or AVIF"} ∙
                (max. {formatBytes(maxSize)})
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={openFileDialog}
              >
                <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
                Select files
              </Button>
            </div>
          )}
        </div>

        {errors.length > 0 && (
          <div
            className="flex items-center gap-1 text-destructive text-xs"
            role="alert"
          >
            <AlertCircleIcon className="size-3 shrink-0" />
            <span>{errors[0]}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        {conversionProgress !== 100 ? (
          <>
            <Button
              variant="default"
              className="h-auto w-full duration-200"
              onClick={handleConvert}
              disabled={isConverting || files.length < 1}
            >
              {isTinypng ? (
                isConverting ? (
                  <div className="flex items-center gap-2">
                    <Spinner className="-ms-1" />
                    Optimizing... ({conversionProgress}%)
                  </div>
                ) : (
                  <>
                    <RocketIcon className="-ms-1" /> Optimize
                  </>
                )
              ) : isConverting ? (
                <div className="flex items-center gap-2">
                  <Spinner className="-ms-1" />
                  Converting... ({conversionProgress}%)
                </div>
              ) : (
                <>
                  <RocketIcon className="-ms-1" /> Convert
                </>
              )}
            </Button>
            {!isTinypng && (
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger className="h-auto min-w-[120px]">
                  <SelectValue placeholder="Output Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image/webp">WEBP</SelectItem>
                  <SelectItem value="image/avif">AVIF</SelectItem>
                  <SelectItem value="image/png">PNG</SelectItem>
                  <SelectItem value="image/jpeg">JPG</SelectItem>
                </SelectContent>
              </Select>
            )}
          </>
        ) : (
          <>
            <Button
              variant="secondary"
              className="h-auto w-full"
              onClick={handleReset}
            >
              <PlusIcon className="-ms-1" /> New{" "}
              {isTinypng ? "Optimzation" : "Conversion"}
            </Button>
            <Button
              variant="default"
              className="h-auto w-full"
              asChild={!!zipUrl}
              disabled={!zipUrl || !convertedFiles || convertedFiles.length < 1}
            >
              {!zipUrl ? (
                <>
                  <DownloadIcon className="-ms-1" /> Download ZIP
                </>
              ) : (
                <a href={zipUrl} download={zipName}>
                  <DownloadIcon className="-ms-1" /> Download ZIP
                </a>
              )}
            </Button>
          </>
        )}
      </div>
      {isTinypng && conversionProgress === 0 && (
        <>
          <div className="flex flex-col items-start justify-start">
            <p className="text-foreground/90">Optimization Level</p>
            <Slider
              className="mt-4 mb-2 w-full"
              defaultValue={[defaultTinypngLevel]}
              value={tinypngLevel}
              min={1}
              max={5}
              step={2}
              onValueChange={(value) => setTinypngLevel(value)}
            />
            <div className="flex w-full items-center justify-between text-muted-foreground text-sm">
              <Button
                variant="link"
                className="h-auto px-0 py-0.5 text-muted-foreground text-sm"
                onClick={() => setTinypngLevel([minTinypngLevel])}
              >
                Better quality
              </Button>
              <Button
                variant="link"
                className="h-auto px-0 py-0.5 text-muted-foreground text-sm"
                onClick={() => setTinypngLevel([maxTinypngLevel])}
              >
                Smaller size{" "}
              </Button>
            </div>
          </div>

          <Alert variant="default" className="bg-accent-secondary/10">
            <CircleHelpIcon
              className="text-accent-secondary-foreground"
              color="oklch(0.8823 0.062 14.69)"
            />
            <AlertTitle className="text-accent-secondary-foreground">
              Note
            </AlertTitle>
            <AlertDescription className="text-accent-secondary-foreground/85">
              <span>
                The highest optimization level will considerably degrade image
                quality. For best results, use the medium setting. That is the
                same as using{" "}
                <span className="font-medium text-accent-secondary-foreground">
                  conversion mode
                </span>
                , and setting output format to PNG.
              </span>
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  )
}
