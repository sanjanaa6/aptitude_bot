// Simple curriculum generator from a topic string
// Produces modules with submodules and estimated times

export function generateCurriculumFromTopic(topic) {
  const clean = String(topic || '').trim()
  const base = clean || 'Your Topic'
  const modules = [
    { title: `Introduction to ${base}`, desc: `Understand the basics of ${base}, its purpose and core concepts.`, level: 'Beginner' },
    { title: `Working with ${base}`, desc: `Create, configure and manage core workflows/tasks.`, level: 'Intermediate' },
    { title: `${base} Components and Integrations`, desc: `Explore components and how to integrate with external services.`, level: 'Intermediate' },
    { title: `Advanced Techniques`, desc: `Optimization, best practices and advanced patterns.`, level: 'Advanced' }
  ]

  const makeSub = (m, i) => [
    { title: `${m} Overview`, minutes: 10 },
    { title: `Key Concepts`, minutes: 10 },
    { title: `Hands-on Exercise`, minutes: 10 },
    { title: `Quiz & Review`, minutes: 10 }
  ].map((s, j) => ({ id: `${i+1}.${j+1}`, ...s }))

  return modules.map((m, i) => ({
    id: `${i+1}`,
    title: m.title,
    description: m.desc,
    level: m.level,
    estimatedMinutes: 40,
    submodules: makeSub(m.title, i)
  }))
}


