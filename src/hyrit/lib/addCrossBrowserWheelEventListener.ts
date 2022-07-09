/**
 * This script became a thing because some browsers support more than one
 * wheel events, making it so you can't just add all possible wheel events
 * because of the risk of the listener being called twice.
 * 
 * Solution: We add a test event listener to all possible wheel events, once
 * one of them is dispatched we remove the tests, and enable the actual event
 * listener, following calls to the function will immediately use the event
 * known to be supported.
 * 
 * Note: This didn't end up being relevant here but IE 9 and 10 do not have
 * the 'onwheel' property in elements though supports it via 'addEventListener'.
 */


type Delta = -1 | 1


/** The names of the wheel events to be tested, in priority order */
const wheelEvents = ['wheel', 'mousewheel', 'DOMMouseScroll']


/** Later fulfilled with the name of the first
 * wheel event detected to be supported */
let supportDetected: string


/** Returns event's delta normalized to -1 | 1 */
function getDelta (e: Event): Delta {
  // @ts-ignore These three properties just never exist in the same event
  return (((e.deltaY || -e.wheelDelta || e.detail) >> 10) || 1) as Delta
}


/** Ensures only one of the supported wheel events
 * in this browser is applied to the element */
export function addCrossBrowserWheelEventListener (
  element: HTMLElement,
  listener: (event: WheelEvent, delta: Delta) => void,
  options?: boolean | AddEventListenerOptions): void {

  const listenerWrapper = function (e: Event): void {
    listener.apply(element, [e as WheelEvent, getDelta(e)])
  }

  // If a supported event is already detected, just add it and stop here
  if (supportDetected) {
    element.addEventListener(supportDetected, listenerWrapper, options)
    return
  }

  const supportedEventDetector = (e: Event) => {

    // Now we know which wheel event is supported in this browser
    supportDetected = e.type

    // Remove tests to prevent other supported events from being called too
    for (const name of wheelEvents) {
      element.removeEventListener(name, supportedEventDetector)
    }

    // Add actual event listener if it's not an once event
    if (!options || (typeof options !== 'boolean' && !options.once)) {
      element.addEventListener(supportDetected, listenerWrapper, options)
    }

    // Run the actual listener manually since this was the support test
    listenerWrapper(e as WheelEvent)

  }


  // Add tests
  for (const name of wheelEvents) {
    element.addEventListener(name, supportedEventDetector, options)
  }

}
