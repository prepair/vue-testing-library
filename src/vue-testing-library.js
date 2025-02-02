import { createLocalVue, mount } from '@vue/test-utils'

import {
  getQueriesForElement,
  prettyDOM,
  wait,
  fireEvent
} from '@testing-library/dom'

const mountedWrappers = new Set()

function render(TestComponent, mountOptions = {}, configurationCb) {
  const localVue = createLocalVue()
  let additionalOptions = {}

  if (configurationCb && typeof configurationCb === 'function') {
    additionalOptions = configurationCb(localVue)
  }

  if (!mountOptions.propsData && !!mountOptions.props) {
    mountOptions.propsData = mountOptions.props
    delete mountOptions.props
  }

  const wrapper = mount(TestComponent, {
    localVue,
    attachToDocument: true,
    sync: false,
    ...mountOptions,
    ...additionalOptions
  })

  mountedWrappers.add(wrapper)

  if (wrapper.element.parentNode === document.body) {
    const div = document.createElement('div')
    wrapper.element.parentNode.insertBefore(div, wrapper.element)
    div.appendChild(wrapper.element)
  }

  return {
    container: wrapper.element.parentNode,
    baseElement: document.body,
    debug: (el = wrapper.element) => console.log(prettyDOM(el)),
    unmount: () => wrapper.destroy(),
    isUnmounted: () => wrapper.vm._isDestroyed,
    html: () => wrapper.html(),
    emitted: () => wrapper.emitted(),
    updateProps: _ => {
      wrapper.setProps(_)
      return wait()
    },
    ...getQueriesForElement(wrapper.element.parentNode)
  }
}

function cleanup() {
  mountedWrappers.forEach(cleanupAtWrapper)
}

function cleanupAtWrapper(wrapper) {
  if (
    wrapper.element.parentNode &&
    wrapper.element.parentNode.parentNode === document.body
  ) {
    document.body.removeChild(wrapper.element.parentNode)
  }
  wrapper.destroy()
  mountedWrappers.delete(wrapper)
}

Object.keys(fireEvent).forEach(fn => {
  fireEvent[`_${fn}`] = fireEvent[fn]
  fireEvent[fn] = async (...params) => {
    fireEvent[`_${fn}`](...params)
    await wait()
  }
})

fireEvent.touch = async elem => {
  await fireEvent.focus(elem)
  await fireEvent.blur(elem)
}

fireEvent.update = async (elem, value) => {
  const tagName = elem.tagName
  const type = elem.type

  switch (tagName) {
    case 'OPTION': {
      elem.selected = value

      const parentElement =
        this.element.parentElement.tagName === 'OPTGROUP'
          ? this.element.parentElement.parentElement
          : this.element.parentElement

      return fireEvent.change(parentElement)
    }

    case 'INPUT': {
      if (type === 'checkbox') {
        elem.checked = value
        return fireEvent.change(elem)
      } else if (type === 'radio') {
        elem.selected = value
        return fireEvent.change(elem)
      } else {
        elem.value = value
        return fireEvent.input(elem)
      }
    }

    case 'TEXTAREA': {
      elem.value = value
      return fireEvent.input(elem)
    }

    case 'SELECT': {
      elem.value = value
      return fireEvent.change(elem)
    }
  }
}

export * from '@testing-library/dom'
export { cleanup, render }
