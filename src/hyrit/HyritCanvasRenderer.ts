import { Camera } from './Camera'
import { addCrossBrowserWheelEventListener } from './lib/addCrossBrowserWheelEventListener'
import { gridInCircle } from './lib/gridInCircle'
import { Vector } from './lib/Vector'



// Types

interface HyritCanvasRendererConfig {
  canvas: HTMLCanvasElement
}


interface RenderArgs {

}



// Class

export class HyritCanvasRenderer {

  private static CLEAR_COLOR: string = '#111111'
  private static ZOOM_STEP = 0.1
  private static ZOOM_MIN = 0.1
  private static ZOOM_MAX = 10

  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private center: Vector = new Vector()
  private camera: Camera = new Camera()
  private mouse: Vector = new Vector()
  private lastMouseMove: Vector = new Vector()

  constructor (config: HyritCanvasRendererConfig) {
    
    this.canvas = config.canvas
    this.ctx = this.canvas.getContext('2d')!

    this.enableResizing()
    this.enablePanning()
    this.enableZooming()

    window.addEventListener('mousemove', e => {
      this.lastMouseMove.x = e.clientX
      this.lastMouseMove.y = e.clientY
      this.updateMousePosition()
    })

  }
  

  public render (_args: RenderArgs): void {

    const { canvas, ctx, camera } = this

    this.clear()
    
    ctx.save()
    ctx.translate(canvas.width * 0.5 - camera.x, canvas.height * 0.5 - camera.y)
    ctx.scale(camera.zoom, camera.zoom)
    
    this.renderGrid()
    this.renderCursor()

    ctx.restore()

    this.renderScreenCenter()

  }


  private clear (): void {
    
    const { canvas, ctx } = this

    ctx.fillStyle = HyritCanvasRenderer.CLEAR_COLOR
    ctx.fillRect(0, 0, canvas.width, canvas.height)

  }


  private renderGrid (): void {

    const tileSize = 100
    const { ctx, camera } = this
  
    ctx.beginPath()

    ctx.lineWidth = 1 / camera.zoom
    ctx.strokeStyle = ctx.fillStyle = '#ffffff22'

    // Grid size text
    ctx.fillText(tileSize + 'x' + tileSize, 5, -10)
  
    // Center
    ctx.arc(0, 0, 5, 0, Math.PI * 2)
  
    // Grid
    for (const [a, b] of gridInCircle(200, tileSize)) {
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
    }
  
    ctx.closePath()
    ctx.stroke()

  }

  private renderCursor (): void {
     
    const { ctx, mouse, camera } = this

    const scale = 1 / camera.zoom

    ctx.beginPath()
    ctx.font = 16 * scale + 'px monospace'
    ctx.lineWidth = 1 / this.camera.zoom
    ctx.fillStyle = ctx.strokeStyle = '#22aa66'
    ctx.arc(mouse.x, mouse.y, 3 / this.camera.zoom, 0, Math.PI * 2)
    ctx.stroke()
    ctx.closePath()
    ctx.fillText(mouse.x.toFixed() + ' ' + mouse.y.toFixed(), mouse.x + 5 * scale, mouse.y - 10 * scale)

  }

  private renderScreenCenter (): void {

    const { ctx, center, camera } = this

    ctx.beginPath()

    ctx.fillStyle = ctx.strokeStyle = '#ffffff'

    ctx.moveTo(center.x - 5, center.y - 5)
    ctx.lineTo(center.x + 5, center.y + 5)
    ctx.moveTo(center.x + 5, center.y - 5)
    ctx.lineTo(center.x - 5, center.y + 5)
    ctx.fillText(camera.x.toFixed() + ' ' + camera.y.toFixed(), center.x + 5, center.y - 10)

    ctx.stroke()
    ctx.closePath()

  }



  // Usability methods

  private enableResizing (): void {

    const { canvas, center } = this

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    center.x = canvas.width * 0.5
    center.y = canvas.height * 0.5
    
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      center.x = canvas.width * 0.5
      center.y = canvas.height * 0.5
    })

  }

  private enablePanning (): void {

    const { canvas, camera } = this

    const touchStartPosition: Vector = new Vector()


    const onStartDrag = (e: MouseEvent | TouchEvent): void => {

      canvas.style.cursor = 'move'

      // Mouse events don't need to keep track of the drag start position

      if ('targetTouches' in e && e.targetTouches.length === 1) {
        touchStartPosition.x = e.targetTouches[0].clientX
        touchStartPosition.y = e.targetTouches[0].clientY
      }

    }

    const onStopDrag = (): void => {
      canvas.style.cursor = ''
    }

    const onDrag = (e: MouseEvent | TouchEvent) => {
      if (canvas.style.cursor === 'move') {
        if ('movementX' in e) {

          // Mouse event

          camera.x -= e.movementX 
          camera.y -= e.movementY

        } else if (e.targetTouches.length === 1) {

          // Touch event
          
          const touch = e.targetTouches[0]

          camera.x -= touch.clientX - touchStartPosition.x
          camera.y -= touch.clientY - touchStartPosition.y

          touchStartPosition.x = touch.clientX
          touchStartPosition.y = touch.clientY
          
        }
      }
    }


    canvas.addEventListener('mousedown', onStartDrag)
    canvas.addEventListener('touchstart', onStartDrag)
    canvas.addEventListener('mouseup', onStopDrag)
    canvas.addEventListener('touchend', onStopDrag)
    canvas.addEventListener('mousemove', onDrag)
    canvas.addEventListener('touchmove', onDrag)

  }

  private enableZooming (): void {

    const { canvas, camera, mouse } = this

    const clamp = (x: number, min: number, max: number): number => {
      return Math.max(min, Math.min(max, x))
    }

    addCrossBrowserWheelEventListener(canvas, (_e, delta) => {

      const oldZoom = camera.zoom

      camera.zoom = clamp(
        camera.zoom - delta * HyritCanvasRenderer.ZOOM_STEP * camera.zoom,
        HyritCanvasRenderer.ZOOM_MIN,
        HyritCanvasRenderer.ZOOM_MAX
      )

      const zoomDifference = oldZoom - camera.zoom

      camera.x -= mouse.x * zoomDifference
      camera.y -= mouse.y * zoomDifference

      this.updateMousePosition()

    })

  }



  // Other

  private updateMousePosition (): void {
    this.mouse.x = (this.lastMouseMove.x - this.canvas.width * 0.5 + this.camera.x) / this.camera.zoom
    this.mouse.y = (this.lastMouseMove.y - this.canvas.height * 0.5 + this.camera.y) / this.camera.zoom
  }

}

