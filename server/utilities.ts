export const sleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

// Picks a count number of random suggestions and return is as a list
export const getRandomSuggestions = (count: number, suggestions: string[]) => {
  if (count >= suggestions.length) {
    return suggestions;
  }

  const randomSuggestions : Set<number> = new Set();

  while (randomSuggestions.size !== count) {
    randomSuggestions.add(Math.floor(Math.random() * suggestions.length));
  }

  const response : string[] = [];
  randomSuggestions.forEach(num => response.push(suggestions[num]));

  return response;
}