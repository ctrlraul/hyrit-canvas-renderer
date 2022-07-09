import { Hyrit } from './hyrit/Hyrit'
import './style.css'



const hyrit = new Hyrit({
  canvas: document.querySelector<HTMLCanvasElement>('canvas')!
})

hyrit.start()
