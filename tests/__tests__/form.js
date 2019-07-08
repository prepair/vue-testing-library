import { render, fireEvent } from '@testing-library/vue'
import 'jest-dom/extend-expect'
import Form from './components/Form'

test('Review form submits', async () => {
  const fakeReview = {
    title: 'An Awesome Movie',
    review: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    rating: '3',
    genre: 'Action',
    recommend: true
  }

  const {
    getByLabelText,
    getByText,
    getByRole,
    getByDisplayValue,
    getByPlaceholderText,
    emitted
  } = render(Form)

  const submitButton = getByText('Submit')

  // Initially the submit button should be disabled
  expect(submitButton).toBeDisabled()

  // In this test we showcase several ways of targetting DOM elements.
  // However, `getByLabelText` should be your top preference when handling
  // form elements.
  // Read 'What queries should I use?' for additional context:
  // https://testing-library.com/docs/guide-which-query

  const titleInput = getByLabelText(/title of the movie/i)
  await fireEvent.update(titleInput, fakeReview.title)

  const reviewTextarea = getByPlaceholderText('Write an awesome review')
  await fireEvent.update(reviewTextarea, fakeReview.review)

  // Rating Radio buttons
  const initiallySelectedInput = getByLabelText('Awful')
  const ratingSelect = getByLabelText('Wonderful')

  expect(initiallySelectedInput.checked).toBe(true)
  expect(ratingSelect.checked).toBe(false)

  await fireEvent.update(ratingSelect)

  expect(ratingSelect.checked).toBe(true)
  expect(initiallySelectedInput.checked).toBe(false)

  // Get the Select element by using the initially displayed value.
  const genreSelect = getByDisplayValue('Comedy')
  await fireEvent.update(genreSelect, fakeReview.genre)

  // Get the Input element by its implicit ARIA role.
  const recommendInput = getByRole('checkbox')

  expect(recommendInput.checked).toBe(false)
  await fireEvent.update(recommendInput)
  expect(recommendInput.checked).toBe(true)

  // NOTE: in jsdom, it's not possible to trigger a form submission
  // by clicking on the submit button. This is really unfortunate.
  // So the next best thing is to fireEvent a submit on the form itself
  // then ensure that there's a submit button.
  expect(submitButton).toBeEnabled()
  expect(submitButton).toHaveAttribute('type', 'submit')

  await fireEvent.click(submitButton)

  // Assert event has been emitted.
  expect(emitted().submit).toHaveLength(1)
  expect(emitted().submit[0]).toEqual([fakeReview])
})
