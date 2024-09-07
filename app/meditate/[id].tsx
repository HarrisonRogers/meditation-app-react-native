import { View, Text, ImageBackground, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AntDesign } from '@expo/vector-icons'
import MEDITATION_IMAGES from '@/constants/meditation-images'
import { MEDITATION_DATA, AUDIO_FILES } from '@/constants/MeditationData'
import AppGradient from '@/components/AppGradient'
import { router, useLocalSearchParams } from 'expo-router'
import CustomButton from '@/components/CustomButton'
import { Audio } from 'expo-av'

const Meditate = () => {
  const { id } = useLocalSearchParams()

  const [secondsRemaining, setSecondsRemaining] = useState(10)
  const [isMeditating, setIsMeditating] = useState(false)
  const [audioSound, setAudioSound] = useState<Audio.Sound>()
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  useEffect(() => {
    let timerId: NodeJS.Timeout

    if (secondsRemaining === 0) {
      setIsMeditating(false)

      // --- Stops audio when time === 0
      // if (audioSound) {
      //   audioSound?.stopAsync()
      //   setIsPlayingAudio(false)
      // }

      return
    }

    if (isMeditating) {
      timerId = setTimeout(() => {
        setSecondsRemaining(secondsRemaining - 1)
      }, 1000)
    }

    return () => {
      clearTimeout(timerId)
    }
  }, [secondsRemaining, isMeditating])

  useEffect(() => {
    return () => {
      if (audioSound) {
        audioSound?.unloadAsync()
      }
    }
  }, [audioSound])

  const toggleMeditationSessionStatus = async () => {
    if (secondsRemaining === 0) setSecondsRemaining(10)

    setIsMeditating(!isMeditating)

    await toggleSound()
  }

  const toggleSound = async () => {
    const sound = audioSound ? audioSound : await initializeSound()

    const status = await sound.getStatusAsync()

    if (status.isLoaded && !isPlayingAudio) {
      console.log('Playing sound...')
      await sound.playAsync()
      setIsPlayingAudio(true)
    } else {
      console.log('Pausing sound...')
      await sound.pauseAsync()
      setIsPlayingAudio(false)
    }
  }

  const initializeSound = async () => {
    const audioFileName = MEDITATION_DATA[Number(id) - 1].audio

    // Set the audio mode and volume
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true, // Ensure it plays in silent mode (if phone is muted)
    })

    const { sound } = await Audio.Sound.createAsync(
      AUDIO_FILES[audioFileName],
      { shouldPlay: false, volume: 1.0 } // Ensure volume is set
    )

    setAudioSound(sound)
    return sound
  }

  // Format time left for two digits displayed
  const formattedTimeMinutes = String(
    Math.floor(secondsRemaining / 60)
  ).padStart(2, '0')
  const formattedTimeSeconds = String(secondsRemaining % 60).padStart(2, '0')

  return (
    <View className="flex-1">
      <ImageBackground
        source={MEDITATION_IMAGES[Number(id) - 1]}
        resizeMode="cover"
        className="flex-1"
      >
        <AppGradient colors={['transparent', 'rgba(0, 0, 0, 0.8)']}>
          <Pressable
            onPress={() => router.back()}
            className="absolute top-16 left-6 z-10"
          >
            <AntDesign name="leftcircleo" size={50} color="white" />
          </Pressable>

          <View className="flex-1 justify-center">
            <View className="mx-auto bg-neutral-200 rounded-full w-44 h-44 justify-center items-center">
              <Text className="text-4xl text-blue-800 font-rmono">
                {formattedTimeMinutes}:{formattedTimeSeconds}
              </Text>
            </View>
          </View>

          <View className="mb-5">
            <CustomButton
              title="Start Meditation"
              onPress={toggleMeditationSessionStatus}
            />
          </View>
        </AppGradient>
      </ImageBackground>
    </View>
  )
}

export default Meditate
