/**
 * Validación de archivos para upload de comprobantes
 */

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
]

export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf']

export interface FileValidationResult {
  valid: boolean
  error?: string
}

/**
 * Valida un archivo antes de subirlo
 */
export function validateFile(file: File): FileValidationResult {
  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `El archivo es demasiado grande. Tamaño máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    }
  }

  // Validar tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no permitido. Solo se permiten: JPG, PNG, WEBP, PDF',
    }
  }

  // Validar extensión
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: 'Extensión no permitida. Solo se permiten: .jpg, .jpeg, .png, .webp, .pdf',
    }
  }

  return { valid: true }
}

/**
 * Genera el path para el archivo en Storage
 */
export function generateStoragePath(userId: string, paymentId: string, fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error('Extensión no permitida')
  }
  return `payments/${userId}/${paymentId}.${ext}`
}

/**
 * Formatea el tamaño del archivo para mostrar
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
