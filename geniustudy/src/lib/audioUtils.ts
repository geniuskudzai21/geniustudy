let audioContext: AudioContext | null = null

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
  return audioContext
}

const bufferCache = new Map<string, AudioBuffer>()

export async function loadAudioBuffer(url: string): Promise<AudioBuffer> {
  if (bufferCache.has(url)) return bufferCache.get(url)!
  const ctx = getAudioContext()
  const res = await fetch(url)
  const arrayBuffer = await res.arrayBuffer()
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
  bufferCache.set(url, audioBuffer)
  return audioBuffer
}

export function createNoiseNode(type: 'white' | 'pink' | 'brown'): AudioNode {
  const ctx = getAudioContext()
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    switch (type) {
      case 'white':
        data[i] = Math.random() * 2 - 1
        break
      case 'pink': {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
        const white = Math.random() * 2 - 1
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        b3 = 0.86650 * b3 + white * 0.3104856
        b4 = 0.55000 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.0168980
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
        b6 = white * 0.115926
        break
      }
      case 'brown': {
        let lastOut = 0
        const white = Math.random() * 2 - 1
        lastOut = (lastOut + (0.02 * white)) / 1.02
        data[i] = lastOut * 3.5
        break
      }
    }
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true
  return source
}

export function createBinauralBeats(freq: number, baseFreq: number = 200): { left: OscillatorNode; right: OscillatorNode; gain: GainNode } {
  const ctx = getAudioContext()
  const gain = ctx.createGain()
  gain.gain.value = 0.05

  const leftOsc = ctx.createOscillator()
  leftOsc.type = 'sine'
  leftOsc.frequency.value = baseFreq

  const rightOsc = ctx.createOscillator()
  rightOsc.type = 'sine'
  rightOsc.frequency.value = baseFreq + freq

  const leftPanner = ctx.createStereoPanner()
  leftPanner.pan.value = -1
  const rightPanner = ctx.createStereoPanner()
  rightPanner.pan.value = 1

  leftOsc.connect(leftPanner).connect(gain)
  rightOsc.connect(rightPanner).connect(gain)

  return { left: leftOsc, right: rightOsc, gain }
}

export function createOscillatorTone(freq: number, type: OscillatorType = 'sine'): OscillatorNode {
  const ctx = getAudioContext()
  const osc = ctx.createOscillator()
  osc.type = type
  osc.frequency.value = freq
  return osc
}
