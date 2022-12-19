import { trpc } from './trpc'

export function useAWS() {
  const utils = trpc.useContext()

  const uploadFile =
    ({
      successCallback,
      errorCallback,
    }: {
      successCallback: () => void
      errorCallback: () => void
    }) =>
    async ({ file, remotePath }: { file?: File; remotePath: string }) => {
      if (file === undefined) return false

      const url = await utils.aws.getUploadUrl.fetch({
        name: remotePath,
      })

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'Access-Control-Allow-Origin': '*',
        },
        body: file,
      })

      if (response.ok) {
        successCallback()
        return true
      }
      errorCallback()
      return false
    }

  const deleteFile =
    ({
      successCallback,
      errorCallback,
    }: {
      successCallback: () => void
      errorCallback: () => void
    }) =>
    async ({ remotePath }: { remotePath: string }) => {
      const url = await utils.aws.getDeleteUrl.fetch({
        name: remotePath,
      })

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      })

      if (response.ok) {
        successCallback()
        return true
      }
      errorCallback()
      return false
    }

  return {
    upload: uploadFile,
    destroy: deleteFile,
  }
}
