import React, { useEffect, createRef } from 'react'
import { makeStyles } from '../styles/tss'
import animation from '../animations/erroranimation.json'

const useStyles = makeStyles()(theme => ({
    animationBox: {
        maxWidth: '560px',
        margin: '0 auto',
        marginTop: '10px',
    },
}))

const Animation = () => {
    let animationContainer = createRef()

    const { classes } = useStyles()

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

    return <div className={classes.animationBox} ref={animationContainer} />
}

export default Animation
