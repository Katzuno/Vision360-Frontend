import React, { useState, useEffect } from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

import "./index.scss"
import VideoRecorder from "../components/video-recorder"
import AudioRecorder from "../components/audio-recorder"

const AudioVideoRecorder = () => {
  const [pause, setPause] = useState(false)

  useEffect(() => {
    console.log("paused")
  }, [pause])

  return (
    <>
      <VideoRecorder pause={pause} />
      <AudioRecorder
        onRecordStart={event => {
          console.log("started recording")
          setPause(false)
        }}
        onRecordEnd={event => {
          console.log("finished recording")
          setPause(false)
        }}
      />
    </>
  )
}

const IndexPage = () => (
  <Layout>
    <SEO title="Home" keywords={[`gatsby`, `application`, `react`]} />
    <AudioVideoRecorder />
  </Layout>
)

export default IndexPage
