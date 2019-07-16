import VeeValidate from 'vee-validate'
import 'jest-dom/extend-expect'

import { createLocalVue } from '@vue/test-utils'
import { render, fireEvent } from '@testing-library/vue'
import Validate from './components/Validate'

test('can validate using plugin', async () => {
  // The third argument of `render` is a callback function that receives the
  // Vue instance as a parameter. This way, we can register plugins such as
  // VeeValidate.
  const localVue = createLocalVue()
  const { getByPlaceholderText, queryByTestId, getByTestId } = render(
    Validate,
    { localVue },
    () => localVue.use(VeeValidate, { events: 'blur' })
  )

  // Assert error messages are not in the DOM when rendering the component.
  expect(queryByTestId('username-errors')).toBeNull()

  const usernameInput = getByPlaceholderText('Username...')
  await fireEvent.touch(usernameInput)

  // After "touching" the input (focusing and blurring), validation error
  // should appear.
  expect(getByTestId('username-errors')).toHaveTextContent(
    'The username field is required.'
  )
})
