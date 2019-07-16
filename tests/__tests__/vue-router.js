import 'jest-dom/extend-expect'

import App from './components/Router/App.vue'
import Home from './components/Router/Home.vue'
import About from './components/Router/About.vue'

import VueRouter from 'vue-router'
import { cleanup, render, fireEvent } from '@testing-library/vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '*', redirect: '/about' }
]

afterEach(cleanup)

test('full app rendering/navigating', async () => {
  // Notice how we pass a `routes` object to our render function.
  const router = new VueRouter({ routes })
  const { queryByTestId } = render(App, { router }, vue => vue.use(VueRouter))

  expect(queryByTestId('location-display')).toHaveTextContent('/')

  await fireEvent.click(queryByTestId('about-link'))

  expect(queryByTestId('location-display')).toHaveTextContent('/about')
})

test('setting initial route', () => {
  // The callback function receives three parameters: the Vue instance where
  // the component is mounted, the store instance (if any) and the router
  // object.
  const router = new VueRouter({ routes })
  const { queryByTestId } = render(App, { router }, vue => {
    vue.use(VueRouter)
    router.push('/about')
  })

  expect(queryByTestId('location-display')).toHaveTextContent('/about')
})
