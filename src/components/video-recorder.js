import React, { useRef, useEffect, useState } from "react"
import Fab from "./fab"
import uniqid from "uniqid"
import { requestInterval, clearRequestedInterval } from "../utils"
import classnames from "classnames"

import "./video-recorder.scss"

import CameraIcon from "../images/camera.inline.svg"
import CircularReveal from "./circular-reveal"

const VideoRecorder = ({ pause }) => {
  const [message, setMessage] = useState("")
  const videoRef = useRef()
  const canvasRef = useRef()
  const [expanded, setExpanded] = useState(false)
  const [expandedScale, setExpandedScale] = useState(1)
  const audioRef = useRef()
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  let interval

  const turnOnCamera = options =>
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: options,
        // video: { facingMode: { exact: "environment" } },
        // video: true,
      })
      .then(stream => {
        videoRef.current.srcObject = stream
        if (!pause) {
          videoRef.current.play()
        }
        setExpanded(true)
      })

  function startRecording() {
    if (videoRef && videoRef.current && window && window.navigator) {
      turnOnCamera({ facingMode: { exact: "environment" } }).catch(err =>
        turnOnCamera(true)
      )

      screenshot()
      requestInterval(screenshot, 1500)
    }
  }

  function screenshot() {
    const canvas = canvasRef.current
    const video = videoRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d").drawImage(video, 0, 0)

    canvas.toBlob(
      async blob => {
        if (!blob) return

        let formData = new FormData()
        const fileName = `${uniqid()}.jpg`
        formData.append("file", blob, fileName)

        try {
          await Promise.all([
            fetch("https://gdcb.ro/api/upload", {
              mode: "no-cors",
              method: "POST",
              body: formData,
            }),
            fetch("https://gdcb.ro/api/upload/face", {
              mode: "no-cors",
              method: "POST",
              body: formData,
            }),
          ])

          console.log("tag", window.tag)

          const [analysisRes, faceRes] = await Promise.all([
            fetch(
              `https://gdcb.ro/api/analyse?img_url=${fileName}&tag=${
                window.tag ? window.tag : ""
              }`
            ),
            fetch(`https://gdcb.ro/api/face?img_url=${fileName}`),
          ])

          const [
            itemsArray,
            { Identical: identical, Name: name },
          ] = await Promise.all([analysisRes.json(), faceRes.json()])

          console.log(itemsArray)

          if (itemsArray.length < 1) {
            return
          }

          const [{ desc, direction, distance }] = itemsArray

          const distanceM = (distance / 1000).toFixed(2)

          if (distanceM < 0.5) {
            window.tag = ""
            setMessage(`${desc} found ${direction}`)
            return
          }
          const isPerson = desc === "person" && name !== undefined

          setMessage(
            direction === "obstacle-front"
              ? `${isPerson ? name : desc} ${distanceM} meters ahead`
              : `${isPerson ? name : desc} ${distanceM} meters ${
                  direction === "front" ? "ahead" : `towards ${direction}`
                }`
          )

          // messageRef.current.focus()
        } catch (error) {
          console.error(error)
        }
      },
      "image/jpeg",
      100
    )
  }

  useEffect(() => {
    console.log("audio finished ", isPlayingAudio)

    if (isPlayingAudio) return

    // setIsPlayingAudio(true)

    fetch(`https://gdcb.ro/api/text-to-speech?text=${message}`)
      .then(res => res.blob())
      .then(blob => {
        if (blob.type !== "audio/wav") {
          return
        }

        setIsPlayingAudio(true)

        audioRef.current.src = URL.createObjectURL(blob)
        audioRef.current.play()
      })
      .catch(err => console.error(err))
  }, [message, isPlayingAudio])

  useEffect(() => {
    audioRef.current.addEventListener("ended", () => {
      setIsPlayingAudio(false)
    })

    const width = window.innerWidth
    const height = window.innerHeight

    setExpandedScale(Math.max(width / height, 1) * 1.5)

    if (!window.navigator || !navigator.permissions) return

    navigator.permissions.query({ name: "camera" }).then(result => {
      // messageRef.current.focus()

      function handleCamera() {
        if (result.state === "granted") {
          startRecording()
        } else if (result.state === "denied") {
          // display a toast
        }
      }

      handleCamera()

      result.onchange = handleCamera

      return clearRequestedInterval(interval)
    })
  }, [])

  return (
    <div className="video-recorder">
      <div
        className={classnames("mdc-snackbar mdc-snackbar--baseline", {
          "mdc-snackbar--open": message.length > 0,
          "mdc-snackbar--opening": message.length === 0,
        })}
      >
        <div className="mdc-snackbar__surface">
          <div className="mdc-snackbar__label" role="status" aria-live="polite">
            {message}
          </div>
        </div>
      </div>
      <Fab
        className="video-recorder__button"
        onClick={startRecording}
        icon={<CameraIcon />}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      >
        <CircularReveal expanded={expanded} expandedScale={expandedScale}>
          <video
            className="video-recorder__video"
            ref={videoRef}
            controls={false}
          />
        </CircularReveal>
        <canvas className="video-recorder__canvas" ref={canvasRef} />
        <audio ref={audioRef} src="" hidden controls={false} />
      </div>
    </div>
  )
}

export default VideoRecorder
