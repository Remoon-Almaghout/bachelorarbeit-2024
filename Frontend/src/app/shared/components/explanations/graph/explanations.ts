export const explanations = {
  nodes: [
    {
      id: 'Explanations 1',
      group: 1,
      selected: false,
      opacity: 1,
    },
    {
      id: 'Explanations 2',
      group: 1,
      selected: false,
      opacity: 1,
    },
    {
      id: 'Course 1',
      group: 2,
      selected: false,
      opacity: 1,
    },
    {
      id: 'Course 2',
      group: 2,
      selected: true,
      opacity: 1,
    },
    {
      id: 'Course 3',
      group: 2,
      selected: false,
      opacity: 1,
    },
    {
      id: 'Topic 1',
      group: 3,
      selected: false,
      opacity: 1,
    },
    {
      id: 'Topic 2',
      group: 3,
      selected: true,
      opacity: 1,
    },
  ],
  links: [
    { source: 'Explanations 1', target: 'Course 1', value: 1, opacity: 1 },
    { source: 'Explanations 1', target: 'Course 2', value: 1, opacity: 1 },
    { source: 'Explanations 2', target: 'Course 3', value: 1, opacity: 1 },
    { source: 'Explanations 2', target: 'Course 1', value: 1, opacity: 1 },
    { source: 'Course 1', target: 'Topic 1', value: 1, opacity: 1 },
    { source: 'Course 2', target: 'Topic 1', value: 1, opacity: 1 },
    { source: 'Course 3', target: 'Topic 1', value: 1, opacity: 1 },
    { source: 'Course 2', target: 'Topic 2', value: 1, opacity: 1 },
  ],
};
