import { HyritCanvasRenderer } from './HyritCanvasRenderer'



interface HyritConfig {
  canvas: HTMLCanvasElement
}



export class Hyrit {

  private renderer: HyritCanvasRenderer

  constructor (config: HyritConfig) {
    this.renderer = new HyritCanvasRenderer(config)
  }


  public start (): void {

    const loop = (): void => {
      this.renderer.render({})
      requestAnimationFrame(loop)
    }

    requestAnimationFrame(loop)

  }

}
