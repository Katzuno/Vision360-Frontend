import uniqid from "uniqid"

self.addEventListener("message", ({ data }) => {
  const { canvas, video } = data

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext("webgl").drawImage(video, 0, 0)

  canvas.toBlob(
    async blob => {
      let formData = new FormData()
      const fileName = `${uniqid()}.jpg`
      formData.append("file", blob, fileName)

      try {
        const res = await fetch("http://gdcb.ro:5000/api/upload", {
          method: "POST",
          body: formData,
        })
        const { url } = await res.json()
        const analysisRes = await fetch(url)
        const analysis = await analysisRes.json()
        console.log(analysis)
      } catch (error) {
        console.error(error)
      }
    },
    "image/jpeg",
    100
  )

  console.log(data)
})
