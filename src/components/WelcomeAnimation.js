import React, { useEffect, createRef } from 'react'
// import { makeStyles } from '../styles/tss'
import animation from '../animations/scientist.json'

import styles from '../../src/styles/animation.module.css'
const Animation = () => {
    let animationContainer = createRef()

    useEffect(() => {
        // Dynamic import to avoid SSR issues
        import('lottie-web').then(lottie => {
            if (animationContainer.current) {
                lottie.default.loadAnimation({
                    container: animationContainer.current,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    animationData: animation,
                })
            }
        })
    }, [])

    return <div className={styles.animationBox} ref={animationContainer} />
}

export default Animation
