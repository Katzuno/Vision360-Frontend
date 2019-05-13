import React, { useEffect } from "React"
import { animated, useSpring } from "react-spring"
import "./circular-reveal.scss"

const CircularReveal = ({ children, expandedScale, expanded = false }) => {
  const style = useSpring({ scale: expanded ? expandedScale : 0 })

  return (
    <animated.div
      className="circular-reveal"
      style={{
        transform: style.scale.interpolate(scale => `scale(${scale})`),
      }}
    >
      <animated.div
        className="circular-reveal__inner"
        style={{
          transform: style.scale.interpolate(scale => `scale(${1 / scale})`),
        }}
      >
        {children}
      </animated.div>
    </animated.div>
  )
}

export default CircularReveal
