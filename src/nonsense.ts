const WORD_API = 'https://random-word-api.herokuapp.com/word?number=3'

function toTitleCase (word) {
  return word[0].toUpperCase() + word.slice(1)
}

export function getName (form: HTMLFormElement): Promise<string> {
  const name = form.elements['name'].value

  if (name) {
    return Promise.resolve(name)
  }

  return fetch(WORD_API)
    .then(res => res.json())
    .then(words => words.map(toTitleCase).join(' '))
    .catch(console.error)
}
