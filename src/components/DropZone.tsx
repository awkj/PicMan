/**
 * DropZone 组件
 * 全屏/大区域拖拽上传区域，支持点击上传和多文件
 */
import { AnimatePresence, motion } from "framer-motion"
import type { ChangeEvent, DragEvent } from "react"
import { useCallback, useRef, useState } from "react"
import { SUPPORTED_INPUT_FORMATS } from "../core/compressor"

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void
  compact?: boolean
}

export function DropZone({ onFilesAdded, compact = false }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return
      const files = Array.from(fileList).filter((f) =>
        SUPPORTED_INPUT_FORMATS.includes(f.type as (typeof SUPPORTED_INPUT_FORMATS)[number]),
      )
      if (files.length > 0) onFilesAdded(files)
    },
    [onFilesAdded],
  )

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    dragCounterRef.current++
    if (dragCounterRef.current === 1) setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      dragCounterRef.current = 0
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
      // 重置 input，允许重复上传同一文件
      e.target.value = ""
    },
    [handleFiles],
  )

  return (
    <motion.div
      layout="position"
      initial={{ borderRadius: 24 }}
      animate={{ borderRadius: compact ? 16 : 24 }}
      className={`relative flex flex-col items-center justify-center cursor-pointer select-none
        ${compact ? "py-6 mx-2 sm:mx-4 mt-4" : "min-h-[50vh] sm:min-h-[60vh] mx-4 sm:mx-6 mt-4 sm:mt-6"}
        glass drop-zone-active:ring-2 drop-zone-active:ring-slate-400 dark:drop-zone-active:ring-slate-500
      `}
      style={{
        border: isDragging ? "2px solid rgba(148, 163, 184, 0.6)" : "2px dashed rgba(148, 163, 184, 0.3)",
        background: isDragging ? "rgba(148, 163, 184, 0.04)" : "rgba(255, 255, 255, 0.01)",
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      aria-label="图片上传区域，点击或拖拽上传"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={SUPPORTED_INPUT_FORMATS.join(",")}
        multiple
        className="hidden"
        onChange={handleInputChange}
        aria-label="选择图片文件"
      />

      <AnimatePresence mode="wait">
        {isDragging ? (
          <motion.div
            key="dragging"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex flex-col items-center gap-3 pointer-events-none"
          >
            <div className="text-6xl leading-none shrink-0 w-20 h-20 flex items-center justify-center text-slate-400">
              ⬇️
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xl font-semibold">松开即可上传</p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-4 pointer-events-none"
          >
            {/* 图标 */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="w-20 h-20 shrink-0 rounded-2xl bg-linear-to-br from-slate-200 to-slate-300 dark:from-slate-800/80 dark:to-slate-900/80 flex items-center justify-center border border-slate-300 dark:border-white/10 shadow-sm">
                <svg
                  className="w-10 h-10 text-slate-500 dark:text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-slate-800 dark:bg-slate-200 rounded-full flex items-center justify-center shadow-sm">
                <svg
                  className="w-3 h-3 text-white dark:text-slate-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </motion.div>

            {!compact && (
              <>
                <div className="text-center">
                  <p className="text-slate-700 dark:text-slate-200 text-xl font-semibold mb-1">拖拽图片到此处</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">或点击选择文件</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {["JPEG", "PNG", "WebP", "AVIF"].map((fmt) => (
                    <span
                      key={fmt}
                      className="px-2 py-0.5 text-xs rounded-full bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-white/10"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </>
            )}

            {compact && <p className="text-gray-400 text-sm">继续添加图片</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
